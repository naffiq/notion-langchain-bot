import TelegramBot from 'node-telegram-bot-api';
import { NotionService } from './notionService';
import { LangChainService } from './langchainService';

export interface TelegramConfig {
  token: string;
  notionApiKey: string;
  notionDatabaseId: string;
  openaiApiKey: string;
  maxSearchResults?: number;
}

export class TelegramBotService {
  private bot: TelegramBot;
  private notionService: NotionService;
  private langchainService: LangChainService;
  private maxSearchResults: number;

  constructor(config: TelegramConfig) {
    this.bot = new TelegramBot(config.token, { polling: true });
    this.notionService = new NotionService(config.notionApiKey, config.notionDatabaseId);
    this.langchainService = new LangChainService(config.openaiApiKey);
    this.maxSearchResults = config.maxSearchResults || 5;

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `
🤖 *Welcome to the Notion Knowledge Bot!*

I can help you search and find information from your Notion database.

*Available commands:*
• Just type your question to search the knowledge base
• /help - Show this help message
• /status - Check bot status

*How to use:*
Simply ask me any question, and I'll search through your Notion database to find relevant information and provide you with a comprehensive answer.

Example: "How do I reset my password?"
      `;

      this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
*How to use this bot:*

🔍 *Search your knowledge base:*
Simply type your question, and I'll search through your Notion database to find relevant information.

📝 *Examples of questions you can ask:*
• "How do I configure the API?"
• "What is the company policy on remote work?"
• "Where can I find the installation guide?"

⚡ *Available commands:*
• /start - Welcome message
• /help - Show this help
• /status - Check if the bot is working

The bot uses AI to understand your questions and find the most relevant information from your Notion database.
      `;

      this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // Handle /status command
    this.bot.onText(/\/status/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, '✅ Bot is running and ready to help!');
    });

    // Handle all other messages as search queries
    this.bot.on('message', async (msg) => {
      // Skip if it's a command
      if (msg.text?.startsWith('/')) {
        return;
      }

      const chatId = msg.chat.id;
      const query = msg.text;

      if (!query || query.trim() === '') {
        this.bot.sendMessage(chatId, 'Please send me a question to search for in your knowledge base.');
        return;
      }

      try {
        // Send typing indicator
        this.bot.sendChatAction(chatId, 'typing');

        // Send initial response
        const processingMsg = await this.bot.sendMessage(chatId, '🔍 Searching your knowledge base...');

        // Search and generate answer
        const answer = await this.langchainService.processQuestion(
          query,
          (keywords: string) => this.notionService.searchPages(keywords, this.maxSearchResults)
        );

        // Delete the processing message
        this.bot.deleteMessage(chatId, processingMsg.message_id);

        // Send the answer
        if (answer.length > 4096) {
          // Split long messages
          const chunks = this.splitMessage(answer, 4096);
          for (const chunk of chunks) {
            await this.bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
          }
        } else {
          this.bot.sendMessage(chatId, answer, { parse_mode: 'Markdown' });
        }
      } catch (error) {
        console.error('Error processing message:', error);
        this.bot.deleteMessage(chatId, msg.message_id);
        this.bot.sendMessage(chatId, '❌ Sorry, I encountered an error while processing your request. Please try again.');
      }
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error);
    });

    console.log('Telegram bot is running...');
  }

  private splitMessage(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const lines = text.split('\n');
    
    for (const line of lines) {
      if (currentChunk.length + line.length + 1 <= maxLength) {
        currentChunk += (currentChunk ? '\n' : '') + line;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = line;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  public stop(): void {
    this.bot.stopPolling();
    console.log('Telegram bot stopped.');
  }
}
