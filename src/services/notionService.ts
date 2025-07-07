import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

export interface NotionPage {
  id: string;
  title: string;
  content: string;
  url: string;
}

export class NotionService {
  private notion: Client;
  private n2m: NotionToMarkdown;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    this.notion = new Client({ auth: apiKey });
    this.n2m = new NotionToMarkdown({ notionClient: this.notion });
    this.databaseId = databaseId;
  }

  async searchPages(query: string, maxResults: number = 5): Promise<NotionPage[]> {
    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
        filter: {
          or: [
            {
              property: 'title',
              rich_text: {
                contains: query,
              },
            },
            {
              property: 'Name', // Adjust based on your database schema
              title: {
                contains: query,
              },
            },
          ],
        },
        page_size: maxResults,
      });

      const pages: NotionPage[] = [];
      
      for (const page of response.results) {
        if ('properties' in page) {
          const title = this.extractTitle(page.properties);
          const content = await this.getPageContent(page.id);
          
          pages.push({
            id: page.id,
            title,
            content,
            url: page.url,
          });
        }
      }

      return pages;
    } catch (error) {
      console.error('Error searching Notion pages:', error);
      throw new Error('Failed to search Notion database');
    }
  }

  private extractTitle(properties: any): string {
    // Try different property names for title
    const titleProp = properties.title || properties.Name || properties.Title;
    
    if (!titleProp) {
      return 'Untitled';
    }

    if (titleProp.type === 'title' && titleProp.title.length > 0) {
      return titleProp.title[0].plain_text;
    }
    
    if (titleProp.type === 'rich_text' && titleProp.rich_text.length > 0) {
      return titleProp.rich_text[0].plain_text;
    }

    return 'Untitled';
  }

  private async getPageContent(pageId: string): Promise<string> {
    try {
      const mdBlocks = await this.n2m.pageToMarkdown(pageId);
      const markdown = this.n2m.toMarkdownString(mdBlocks);
      return markdown.parent;
    } catch (error) {
      console.error(`Error converting page ${pageId} to markdown:`, error);
      return 'Failed to retrieve content';
    }
  }

  async getAllPages(): Promise<NotionPage[]> {
    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
      });

      const pages: NotionPage[] = [];
      
      for (const page of response.results) {
        if ('properties' in page) {
          const title = this.extractTitle(page.properties);
          const content = await this.getPageContent(page.id);
          
          pages.push({
            id: page.id,
            title,
            content,
            url: page.url,
          });
        }
      }

      return pages;
    } catch (error) {
      console.error('Error retrieving all pages:', error);
      throw new Error('Failed to retrieve pages from Notion database');
    }
  }
}
