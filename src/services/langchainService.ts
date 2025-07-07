import { OpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { NotionPage } from './notionService';

export class LangChainService {
  private llm: OpenAI;
  private searchPrompt: PromptTemplate;
  private answerPrompt: PromptTemplate;

  constructor(openaiApiKey: string) {
    this.llm = new OpenAI({
      openAIApiKey: openaiApiKey,
      temperature: 0.3,
      modelName: 'gpt-3.5-turbo',
    });

    this.searchPrompt = PromptTemplate.fromTemplate(`
      Based on the user's question: "{question}"
      
      Extract the most relevant search keywords that would help find information in a knowledge base.
      Return only the keywords, separated by spaces, without any explanation.
      
      Question: {question}
      Keywords:`);

    this.answerPrompt = PromptTemplate.fromTemplate(`
      You are a helpful assistant that answers questions based on the provided context from a Notion database.
      
      Context from Notion pages:
      {context}
      
      Question: {question}
      
      Instructions:
      - Answer the question based on the provided context
      - If the context doesn't contain enough information, say so clearly
      - Provide specific information when available
      - If you reference specific pages, mention their titles
      - Be concise but comprehensive
      - Format your response clearly using markdown when appropriate
      
      Answer:`);
  }

  async generateSearchKeywords(question: string): Promise<string> {
    try {
      const chain = RunnableSequence.from([
        this.searchPrompt,
        this.llm,
        new StringOutputParser(),
      ]);

      const result = await chain.invoke({ question });
      return result.trim();
    } catch (error) {
      console.error('Error generating search keywords:', error);
      // Fallback to using the original question
      return question;
    }
  }

  async generateAnswer(question: string, pages: NotionPage[]): Promise<string> {
    try {
      const context = this.formatContext(pages);
      
      const chain = RunnableSequence.from([
        this.answerPrompt,
        this.llm,
        new StringOutputParser(),
      ]);

      const result = await chain.invoke({ 
        question, 
        context 
      });

      return result.trim();
    } catch (error) {
      console.error('Error generating answer:', error);
      return 'Sorry, I encountered an error while processing your question. Please try again.';
    }
  }

  private formatContext(pages: NotionPage[]): string {
    if (pages.length === 0) {
      return 'No relevant information found in the knowledge base.';
    }

    return pages.map((page, index) => {
      return `
**Page ${index + 1}: ${page.title}**
URL: ${page.url}

${page.content}

---
`;
    }).join('\n');
  }

  async processQuestion(question: string, searchFunction: (keywords: string) => Promise<NotionPage[]>): Promise<string> {
    try {
      // Generate search keywords
      const keywords = await this.generateSearchKeywords(question);
      console.log(`Search keywords: ${keywords}`);
      
      // Search for relevant pages
      const pages = await searchFunction(keywords);
      console.log(`Found ${pages.length} relevant pages`);
      
      // Generate answer based on found pages
      const answer = await this.generateAnswer(question, pages);
      
      return answer;
    } catch (error) {
      console.error('Error processing question:', error);
      return 'Sorry, I encountered an error while processing your question. Please try again later.';
    }
  }
}
