import { GeminiController, PostType } from "./controllers/GeminiController";
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// configuration/variables
const CONFIG = {
  TOKEN: process.env.DISCORD_TOKEN,
  REGEX_PATTERN: /(?<![a-zA-Z])(hiring|(?:looking|available|open|recruiting)\sfor\s+(?:a\s+|an\s+|some\s+|someone\s+)?(?:freelancer|contractor|dev|engineer|developer|app developer|mobile app developer|game developer|game dev|professional game developer|designer|writer|assistant|musician|artist|animator|3d artist|pixel artist|job|work|hire)|i offer|contact me for|commission)(?![a-zA-Z])/gi,
  JOB_SEEKER_MESSAGE: 'Please move job-related posts to <#764031405616398367>',
  TEAM_SEEKER_MESSAGE: 'Please move team search like posts to <#1491135020776034445>',
};

try {
  if (client) {
    client.once('clientReady', () => {
      console.log(`Logged in as ${client.user?.tag}`);
    });

    client.on('messageCreate', async (message) => {
      // ignore bots
      if (message.author.bot || message.author.id === client.user?.id) return;

      try {
        const content = message.content;

        if (CONFIG.REGEX_PATTERN.test(content)) {

          const response = await GeminiController.getResponse(content);

          if (response.post_type == PostType.JOB_SEEKER) {
            // reply to the user 
            try {
              await message.reply(CONFIG.JOB_SEEKER_MESSAGE);
            } catch (err) {
              console.error(err);
            }
            console.log(
              `[Triggered] User: ${message.author.tag} | Guild: ${message.guild?.name || 'DM'} | Channel: ${(message.channel as TextChannel)?.name ?? 'DM'}`
            );
          }
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
  } else {
    throw new Error('Client Issue');
  }
} catch (err) {
  console.error(err);
}
