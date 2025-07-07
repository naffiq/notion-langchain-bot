# Notion LangChain Telegram Bot

A TypeScript-based Telegram chatbot that searches and provides answers from your Notion database using LangChain and the notion-to-md library.

## Features

- 🤖 Telegram bot integration
- 🔍 Semantic search through Notion database
- 🧠 AI-powered answer generation using LangChain
- 📝 Notion content converted to Markdown
- ⚡ Real-time responses
- 🛡️ Error handling and graceful shutdowns

## Prerequisites

Before running this bot, you need:

1. **Telegram Bot Token**: Create a bot via [@BotFather](https://t.me/BotFather)
2. **Notion API Key**: Get it from [Notion Integrations](https://www.notion.so/my-integrations)
3. **Notion Database ID**: The ID of the database you want to search
4. **OpenAI API Key**: Get it from [OpenAI Platform](https://platform.openai.com/api-keys)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd notion-langchain-bot
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here
OPENAI_API_KEY=your_openai_api_key_here
MAX_SEARCH_RESULTS=5
BOT_USERNAME=your_bot_username
```

### 3. Notion Setup

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Copy the "Internal Integration Token" as your `NOTION_API_KEY`
3. Share your database with the integration:
   - Go to your Notion database
   - Click "..." → "Add connections" → Select your integration
4. Get your database ID from the URL: `https://notion.so/yourworkspace/DATABASE_ID?v=...`

### 4. Telegram Bot Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the instructions
3. Copy the bot token to your `.env` file
4. Optionally, set bot commands with `/setcommands`:
   ```
   start - Welcome message and instructions
   help - Show help information
   status - Check bot status
   ```

## Running the Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Watch Mode (for development)
```bash
npm run watch
```

## Usage

Once the bot is running:

1. Start a chat with your bot on Telegram
2. Send `/start` to see the welcome message
3. Ask any question about your Notion database content
4. The bot will search and provide AI-generated answers

### Example Interactions

```
User: "How do I reset my password?"
Bot: 🔍 Searching your knowledge base...
Bot: Based on your knowledge base, here's how to reset your password: [detailed answer with relevant information from Notion pages]

User: "What is the company policy on remote work?"
Bot: 🔍 Searching your knowledge base...
Bot: According to the information in your database: [AI-generated answer based on Notion content]
```

## Available Commands

- `/start` - Welcome message and instructions
- `/help` - Show available commands and usage instructions
- `/status` - Check if the bot is running properly

## Project Structure

```
src/
├── index.ts                 # Main application entry point
└── services/
    ├── notionService.ts     # Notion API integration and content conversion
    ├── langchainService.ts  # LangChain AI processing
    └── telegramService.ts   # Telegram bot handling
```

## Features Explained

### Notion Integration
- Connects to your Notion database using the official Notion API
- Searches pages based on title and content
- Converts Notion pages to Markdown using `notion-to-md`

### LangChain Processing
- Uses OpenAI GPT-3.5-turbo for intelligent responses
- Generates search keywords from user questions
- Creates contextual answers based on found Notion content

### Telegram Bot
- Handles user messages and commands
- Provides typing indicators and real-time feedback
- Supports message splitting for long responses
- Graceful error handling

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check if all environment variables are set correctly
2. **Notion access errors**: Ensure the integration is shared with your database
3. **OpenAI API errors**: Verify your API key and check your usage limits
4. **Build errors**: Run `npm install` to ensure all dependencies are installed

### Logs

The bot provides detailed console logs:
- ✅ Successful operations
- ❌ Errors with details
- 🔍 Search operations
- 📱 Bot status updates

## Development

### Adding New Features

1. **New Notion properties**: Modify `notionService.ts` to handle additional page properties
2. **Custom prompts**: Update `langchainService.ts` to change AI behavior
3. **New commands**: Add handlers in `telegramService.ts`

### Testing

```bash
# Build the project
npm run build

# Run with development logging
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure your Notion integration has proper permissions
4. Check your OpenAI API usage limits

For additional help, please open an issue in the repository.
