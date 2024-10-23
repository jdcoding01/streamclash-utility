const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const { fetchCharactersByLicenseValley, transferLicenseValleyCharacter } = require("../helpers/valley_license_transfer");
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
        .setName('license_transfer')
        .setDescription('Transfer character from one license to another')
        .addStringOption(option =>
            option.setName('oldlicense')
                .setDescription('Old License for the user')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('newlicense')
                .setDescription('New License for the user')
                .setRequired(true)
        ),

    async execute(interaction) {
        const oldLicense = interaction.options.getString('oldlicense');
        const newLicense = interaction.options.getString('newlicense');
        const channelId = "1296588435204739124";
        const requesterId = interaction.user.id;

        var users = [];

        console.log(`Provided old license: ${oldLicense}, new license: ${newLicense}`);

        // Fetch characters with the old license
        const characters = await fetchCharactersByLicenseValley(oldLicense);

        users.push(...characters);

        // Create buttons dynamically from the fetched users
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
            content: 'Click the button below to select the character to transfer to the new license:',
            components: characterComponents,
        });

        // Collect button interactions
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            const selectedOldLicense = oldLicense;
            const identifier = i.customId;

            // Show confirmation modal
            const modal = new ModalBuilder()
                .setCustomId('license_transfer_confirmation')
                .setTitle('License Transfer Confirmation');

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

                if (modalInteraction.customId === 'license_transfer_confirmation') {
                    const confirmationValue = modalInteraction.fields.getTextInputValue('confirmation_input');

                    // Confirm that the entered value matches the character name
                    if (confirmationValue === identifier.split("/")[1]) {
                        try {
                            // Defer the reply to give more time for processing
                            await modalInteraction.deferReply({ ephemeral: false });

                            // Initial embed showing the start of the transfer process
                            const transferEmbed = new EmbedBuilder()
                                .setColor(0xFFFF00) // Yellow color for in-progress
                                .setTitle('License Transfer in Progress')
                                .setDescription(`Starting transfer for character: ${identifier.split("/")[1]}`)
                                .addFields(
                                    { name: 'Old License', value: `${selectedOldLicense}`, inline: true },
                                    { name: 'New License', value: `${newLicense}`, inline: true },
                                    { name: 'Transferred By', value: `${interaction.user.tag}`, inline: true },
                                    { name: 'Logs', value: 'Initializing transfer process...', inline: false }
                                )
                                .setTimestamp();

                            // Send the initial embed and get the message reference
                            const embedMessage = await modalInteraction.followUp({ embeds: [transferEmbed], ephemeral: false });

                            // Function to update the latest log in the embed
                            const updateLogsInEmbed = async (logMessage) => {
                                const updatedEmbed = EmbedBuilder.from(transferEmbed)
                                    .setDescription(`Transfer in progress for character: ${identifier.split("/")[1]}`)
                                    .spliceFields(3, 1, { name: 'Logs', value: logMessage || 'No logs yet...', inline: false })
                                    .setTimestamp();
                                await embedMessage.edit({ embeds: [updatedEmbed] });
                            };

                            const log = async (message) => {
                                await updateLogsInEmbed(message);
                            };

                            // Start logging the transfer process
                            await log('Starting transfer process...');
                            await transferLicenseValleyCharacter(`${identifier.split("/")[0]}:${selectedOldLicense}`, newLicense, log);

                            // Final update when transfer is completed
                            const finalEmbed = EmbedBuilder.from(transferEmbed)
                                .setColor(0x00FF00) // Green for success
                                .setTitle('License Transfer Completed')
                                .setDescription(`Character with old license ${selectedOldLicense} has been successfully transferred to new license ${newLicense}.`)
                                .spliceFields(3, 1, { name: 'Logs', value: 'Transfer completed.', inline: false })
                                .setTimestamp();

                            await embedMessage.edit({ embeds: [finalEmbed] });

                        } catch (error) {
                            console.error('Error transferring character license:', error);
                            await modalInteraction.editReply({
                                content: `There was an error transferring the character license from ${selectedOldLicense} to ${newLicense}. Please try again.`,
                            });
                        }
                    } else {
                        await modalInteraction.reply({
                            content: `The confirmation input did not match the character name: ${identifier.split("/")[1]}. Operation canceled.`,
                            ephemeral: true
                        });
                    }
                }
            });
        });
    },
};
