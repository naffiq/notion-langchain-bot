import dotenv from 'dotenv';
import { TelegramBotService } from './services/telegramService';

// Load environment variables
dotenv.config();

async function main() {
  // Validate required environment variables
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'NOTION_API_KEY',
    'NOTION_DATABASE_ID',
    'OPENAI_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    console.error('\nPlease create a .env file based on .env.example and fill in the required values.');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting Notion LangChain Telegram Bot...');

    const bot = new TelegramBotService({
      token: process.env.TELEGRAM_BOT_TOKEN!,
      notionApiKey: process.env.NOTION_API_KEY!,
      notionDatabaseId: process.env.NOTION_DATABASE_ID!,
      openaiApiKey: process.env.OPENAI_API_KEY!,
      maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS || '5'),
    });

    console.log('✅ Bot started successfully!');
    console.log('📱 The bot is now listening for messages...');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
      bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
      bot.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start the bot:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
