const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const { fetchCharactersByLicenseValley, deleteValleyCharacter } = require("../helpers/valley_characterv2");
const path = require("path");

// Load the allowed approvers (can be user IDs or role IDs)
let allowedApprovers = [];
if (fs.existsSync('./approvers.json')) {
    allowedApprovers = JSON.parse(fs.readFileSync('./approvers.json'));
}

// Load the guild configurations (channel IDs) from a config file
let guildConfigs = {};
if (fs.existsSync('./guild_config.json')) {
    guildConfigs = JSON.parse(fs.readFileSync('./guild_config.json'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_character')
        .setDescription('Delete specified character')
        .addStringOption(option =>
            option.setName('license')
                .setDescription('License for the user')
                .setRequired(true)
        ),

    async execute(interaction) {
        const license = interaction.options.getString('license');
        const channelId = "1296588435204739124";
        const requesterId = interaction.user.id;

        var users = [];

        console.log(`Provided license: ${license}`);

        const characters = await fetchCharactersByLicenseValley(license);

        users.push(...characters);

        // Create buttons dynamically from the dummy array
        const characterComponents = users.map(user =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${user.identifier.split(":")[0]}/${user.first_name} ${user.last_name}`)
                    .setLabel(`${user.identifier.split(":")[0]} | ${user.first_name} ${user.last_name}`)
                    .setStyle(ButtonStyle.Primary)
            )
        );

        // Display buttons for character selection
        await interaction.reply({
            content: 'Click the button below to select the character to delete for the specified license:',
            components: characterComponents,
        });

        // Collect button interactions
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            const selectedLicense = license;
            const identifier = i.customId;

            // Show confirmation modal
            const modal = new ModalBuilder()
                .setCustomId('character_deletion_confirmation')
                .setTitle('Delete');

            const confirmationInput = new TextInputBuilder()
                .setCustomId('confirmation_input')
                .setLabel(`Confirm character name: ${identifier.split("/")[1]}`)
                .setStyle(TextInputStyle.Short);

            const inputRow = new ActionRowBuilder().addComponents(confirmationInput);
            modal.addComponents(inputRow);

            await i.showModal(modal);

            // Stop the collector after showing the modal
            collector.stop();

            interaction.client.once('interactionCreate', async (modalInteraction) => {
                if (!modalInteraction.isModalSubmit()) return;

                if (modalInteraction.customId === 'character_deletion_confirmation') {
                    const confirmationValue = modalInteraction.fields.getTextInputValue('confirmation_input');

                    // Confirm that the entered value matches the character license
                    if (confirmationValue === identifier.split("/")[1]) {
                        try {
                            // Defer the reply to give more time for processing
                            await modalInteraction.deferReply({ ephemeral: false });

                            // Initial embed showing the start of the deletion process
                            const deletionEmbed = new EmbedBuilder()
                                .setColor(0xFFFF00) // Yellow color for in-progress
                                .setTitle('Character Deletion in Progress')
                                .setDescription(`Starting deletion for character: ${identifier.split("/")[1]}`)
                                .addFields(
                                    { name: 'License', value: `${selectedLicense}`, inline: true },
                                    { name: 'Deleted By', value: `${interaction.user.tag}`, inline: true },
                                    { name: 'Logs', value: 'Initializing deletion process...', inline: false }
                                )
                                .setTimestamp();

                            // Send the initial embed and get the message reference
                            const embedMessage = await modalInteraction.followUp({ embeds: [deletionEmbed], ephemeral: false });

                            // Function to update the latest log in the embed
                            const updateLogsInEmbed = async (logMessage) => {
                                const updatedEmbed = EmbedBuilder.from(deletionEmbed)
                                    .setDescription(`Deletion in progress for character: ${identifier.split("/")[1]}`)
                                    .spliceFields(2, 1, { name: 'Logs', value: logMessage || 'No logs yet...', inline: false })
                                    .setTimestamp();
                                await embedMessage.edit({ embeds: [updatedEmbed] });
                            };

                            const log = async (message) => {
                                await updateLogsInEmbed(message);
                            };

                            // Start logging the deletion process
                            await log('Starting deletion process...');
                            await deleteValleyCharacter(`${identifier.split("/")[0]}:${selectedLicense}`, log);

                            // Final update when deletion is completed
                            const finalEmbed = EmbedBuilder.from(deletionEmbed)
                                .setColor(0x00FF00) // Green for success
                                .setTitle('Character Deletion Completed')
                                .setDescription(`Character with license ${selectedLicense} has been successfully deleted.`)
                                .spliceFields(2, 1, { name: 'Logs', value: 'Deletion completed.', inline: false })
                                .setTimestamp();

                            await embedMessage.edit({ embeds: [finalEmbed] });



                        } catch (error) {
                            console.error('Error deleting character:', error);
                            await modalInteraction.editReply({
                                content: `There was an error deleting the character with license ${selectedLicense}. Please try again.`,
                            });
                        }
                    } else {
                        await modalInteraction.reply({
                            content: `The confirmation input did not match the name: ${identifier.split("/")[1]}. Operation canceled.`,
                            ephemeral: true
                        });
                    }
                }
            });
        });
    },
};
