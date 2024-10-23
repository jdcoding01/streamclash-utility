const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');

// Load the guild configurations (channel IDs) from a config file
let guildConfigs = {};
if (fs.existsSync('./guild_config.json')) {
  guildConfigs = JSON.parse(fs.readFileSync('./guild_config.json'));
}

// Function to save the guild configs back to the file
function saveGuildConfigs() {
  fs.writeFileSync('./guild_config.json', JSON.stringify(guildConfigs, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Utility commands for managing servers')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add_server')
        .setDescription('Add a new server and approval channel')
        .addStringOption(option =>
          option.setName('server_name')
            .setDescription('The name of the server')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('approval_channel')
            .setDescription('Select the approval channel')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)) // Only allow selecting text channels
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id; // Get the current guild ID
    const serverName = interaction.options.getString('server_name'); // Get the server name from the command
    const approvalChannel = interaction.options.getChannel('approval_channel'); // Get the selected approval channel

    // Check if the guild is already added
    if (guildConfigs[guildId]) {
      return interaction.reply({
        content: `This server is already configured with name **${guildConfigs[guildId].name}** and channel **<#${guildConfigs[guildId].approval_channel_id}>**.`,
        ephemeral: true
      });
    }

    // Add the guild configuration
    guildConfigs[guildId] = {
      name: serverName,
      approval_channel_id: approvalChannel.id
    };

    // Save the new configuration to the file
    saveGuildConfigs();

    // Confirm to the user that the server was added
    await interaction.reply({
      content: `Server **${serverName}** added with approval channel **<#${approvalChannel.id}>**.`,
      ephemeral: true
    });
  },
};
