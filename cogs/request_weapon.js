const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// local
const { insertWeaponShipment } = require("../helpers/insertWeaponShipment");

// Load the allowed approvers (can be user IDs or role IDs)
let allowedApprovers = [];

// Load the allowed approvers from a file (if it exists)
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
    .setName('request_weapon')
    .setDescription('Request a weapon shipment')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user receiving the shipment')
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    // Get the target user from the command
    const targetUser = interaction.options.getUser('target');

    // Get requester ID and channel ID (ticketId)
    const requesterId = interaction.user.id; // ID of the user who ran the command
    const ticketId = interaction.channel.id; // ID of the channel where the command was run

    // Check if the guild's approval channel is set in the config
    if (!guildConfigs[guildId] || !guildConfigs[guildId].approval_channel_id) {
      return interaction.reply({
        content: `Approval channel is not configured for this server.`,
        ephemeral: true
      });
    }

    const approvalChannelId = guildConfigs[guildId].approval_channel_id;

    // Step 1: Create a button for submitting the selection
    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm_weapon')
      .setLabel('Submit Weapon Request')
      .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder().addComponents(confirmButton);

    // Send the button to the user
    await interaction.reply({
      content: 'Click the button below to request weapons:',
      components: [buttonRow],
    });

    // Collector for the button interaction
    const filter = (i) => i.user.id === interaction.user.id; // Filter for the specific user
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000, // 1 minute to interact
    });

    let weaponData = {}; // Declare here to pass it to approval collector

    collector.on('collect', async (i) => {
      if (i.customId === 'confirm_weapon') {
        // Step 2: Dynamically generate a modal with all weapons listed
        const weaponText = `
BP_WEAPON_BAS_P_RED: 0
BP_WEAPON_BULLPUP_SMG: 0
BP_WEAPON_GRAUV2: 0
BP_WEAPON_ISYV2: 0
BP_WEAPON_HK516V2: 0
BP_WEAPON_L85: 0
BP_WEAPON_LMTM4R: 0
BP_WEAPON_M133V3: 0
BP_WEAPON_M4A5V2: 0
BP_WEAPON_M4ASIIMOV: 0
BP_WEAPON_NVRIFLE_PURPLE: 0
BP_WEAPON_SCAR-L: 0
BP_WEAPON_XM7_6_8: 0
WEAPON_DDM4V5: 0
WEAPON_AK47_ASIIMOV: 0
WEAPON_AK47_NIGHTWISH: 0
WEAPON_BERYL_762: 0
WEAPON_GALILARV2: 0
WEAPON_GAU_5A: 0
WEAPON_HOWAT20: 0
WEAPON_M47V2: 0
WEAPON_M4_T_NEON: 0
WEAPON_MP5: 0
WEAPON_NVRIFLE: 0
WEAPON_P20_ASIIMOV: 0
WEAPON_SCEVO: 0
WEAPON_UMP: 0
WEAPON_R90: 0
WEAPON_ZIPTIE: 0
WEAPON_GLOCK40S: 0
WEAPON_MI9: 0
WEAPON_TEC9: 0
WEAPON_SP: 0
WEAPON_ARPISTOL: 0
WEAPON_PLR: 0
WEAPON_MPX: 0
WEAPON_LOK: 0
WEAPON_GLOCK19S: 0
WEAPON_ASVAL: 0
WEAPON_GLOCK17S: 0
WEAPON_GLOCK26S: 0
WEAPON_APS: 0
WEAPON_FAMAS: 0
WEAPON_FAMAS_YELLOW: 0
WEAPON_HKUSP: 0
WEAPON_M270D: 0
WEAPON_M27S: 0
WEAPON_M4A1_MOD: 0
WEAPON_M4_A_W: 0
WEAPON_MODULAR_RIFLE: 0
WEAPON_VECTOR: 0
WEAPON_BARP: 0
WEAPON_MICRODRACO: 0
WEAPON_DESERT_EAGLE: 0
WEAPON_P250_ASIIMOV: 0
WEAPON_MAC10: 0
WEAPON_MP7: 0
`;

        const modal = new ModalBuilder()
          .setCustomId('weapon_quantity_modal')
          .setTitle('Enter Weapon Quantities');

        const weaponsInput = new TextInputBuilder()
          .setCustomId('weapons_input')
          .setLabel('Modify quantities below:')
          .setStyle(TextInputStyle.Paragraph)
          .setValue(weaponText)
          .setRequired(true);

        const modalRow = new ActionRowBuilder().addComponents(weaponsInput);
        modal.addComponents(modalRow);

        await i.showModal(modal);
      }
    });

    // Listen for the modal submission
    interaction.client.on('interactionCreate', async (modalInteraction) => {
      if (!modalInteraction.isModalSubmit()) return;

      try {
        await modalInteraction.deferReply({ ephemeral: true });

        if (modalInteraction.customId === 'weapon_quantity_modal') {
          const user = interaction.user;

          // Collect the user-edited text input
          const weaponsWithQuantities = modalInteraction.fields.getTextInputValue('weapons_input');
          const weaponLines = weaponsWithQuantities.split('\n');
          weaponData = {};

          weaponLines.forEach(line => {
            const [weapon, quantity] = line.split(':').map(item => item.trim());
            if (weapon && quantity) {
              weaponData[weapon] = parseInt(quantity, 10) || 0; 
            }
          });

          weaponData.TargetDiscordID = targetUser.id;

          await modalInteraction.editReply({
            content: `Weapon shipment request submitted! Pending approval.`,
          });

          const shipmentEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Weapon Shipment Request')
            .setDescription('A weapon shipment request has been made.')
            .addFields(
              { name: 'Requester', value: user.tag, inline: true },
              { name: 'Target User', value: targetUser.tag, inline: true },
              { name: 'Requested Weapons', value: weaponsWithQuantities.substring(0, 1024), inline: false }
            )
            .setTimestamp();

          const approveButton = new ButtonBuilder()
            .setCustomId('approve_shipment')
            .setLabel('Approve')
            .setStyle(ButtonStyle.Success);

          const denyButton = new ButtonBuilder()
            .setCustomId('deny_shipment')
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger);

          const approvalRow = new ActionRowBuilder().addComponents(approveButton, denyButton);

          const approvalChannel = await interaction.guild.channels.fetch(approvalChannelId);
          if (!approvalChannel) {
            console.error(`Approval channel with ID ${approvalChannelId} not found.`);
            return;
          }

          const approvalMessage = await approvalChannel.send({
            content: 'A new weapon shipment request has been made:',
            embeds: [shipmentEmbed],
            components: [approvalRow],
          });

          const approvalCollector = approvalMessage.createMessageComponentCollector({
            filter: (buttonInteraction) =>
              allowedApprovers.includes(buttonInteraction.user.id) ||
              buttonInteraction.member.roles.cache.some(role => allowedApprovers.includes(role.id)),
            time: 60000, 
          });

          approvalCollector.on('collect', async (approvalInteraction) => {
            if (approvalInteraction.customId === 'approve_shipment') {
              const verifierId = approvalInteraction.user.id; // ID of the user who approved the shipment
              
              await approvalInteraction.update({ content: `Shipment approved by ${approvalInteraction.user.tag}.`, components: [] });

              console.log(JSON.stringify(weaponData, null, 2));

              try {
                await insertWeaponShipment(weaponData, verifierId, requesterId, ticketId);
              } catch (err) {
                console.error('Error inserting shipment into the database:', err);
              }

              try {
                const dmEmbed = new EmbedBuilder()
                  .setColor(0x00FF00)
                  .setTitle('Your Weapon Shipment Has Been Approved!')
                  .setDescription('Your requested weapon shipment has been approved.')
                  .addFields(
                    { name: 'Requested by', value: user.tag },
                    { name: 'Weapons', value: weaponsWithQuantities.substring(0, 1024) }
                  )
                  .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
              } catch (err) {
                console.error(`Could not send DM to ${targetUser.tag}:`, err);
              }
            } else if (approvalInteraction.customId === 'deny_shipment') {
              await approvalInteraction.update({ content: `Shipment denied by ${approvalInteraction.user.tag}.`, components: [] });
            }
          });
        }
      } catch (error) {
        console.error('Error handling modal interaction:', error);
      }
    });
  },
};
