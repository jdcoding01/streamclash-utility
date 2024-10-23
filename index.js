const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const fs = require('fs'); // To read files from the cogs folder
const path = require('path');

// Initialize the client with necessary intents
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Create a collection to hold commands
client.commands = new Collection();

// Path to the cogs folder
const cogsPath = path.join(__dirname, 'cogs');
const commandFiles = fs.readdirSync(cogsPath).filter(file => file.endsWith('.js'));

// Load each command into the bot
for (const file of commandFiles) {
  const filePath = path.join(cogsPath, file);
  const command = require(filePath);
  
  // Set a new command in the Collection with the key as the command name and value as the exported module
  client.commands.set(command.data.name, command);
}

// Register the commands with Discord via the REST API
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Convert the commands in client.commands to a format that the REST API expects
    const commands = client.commands.map(cmd => cmd.data.toJSON());

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Event when the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Event to handle interactions (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
  }
});

client.login(token);
