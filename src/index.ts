const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// configuration/variables
const CONFIG = {
  TOKEN: 'HERE_TOKEN',
  REGEX_PATTERN: /(?<![a-zA-Z])(hiring|(?:looking|available|open|recruiting)\sfor\s+(?:a\s+|an\s+|some\s+|someone\s+)?(?:freelancer|contractor|dev|engineer|developer|app developer|mobile app developer|game developer|game dev|professional game developer|designer|writer|assistant|musician|artist|animator|3d artist|pixel artist|job|work|hire)|i offer|contact me for|commission)(?![a-zA-Z])/gi,
  RESPONSE_MESSAGE: 'Please move job-related posts to <#764031405616398367>'
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // ignore bots
  if (message.author.bot || message.author.id === client.user.id) return;

  try {
    // check if message matches regex
    if (CONFIG.REGEX_PATTERN.test(message.content.toLowerCase()) && message.name?.toLowerCase().includes("general")) {
      // reply to the user 
      await message.reply(CONFIG.RESPONSE_MESSAGE);
      console.log(
        `[Triggered] User: ${message.author.tag} | Guild: ${message.guild?.name || 'DM'} | Channel: ${message.channel.name}`
      );
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

client.login(CONFIG.TOKEN).catch(error => {
  console.error('Failed to login:', error.message);
  process.exit(1);
});
