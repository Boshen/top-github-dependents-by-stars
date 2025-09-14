import axios from 'axios';
import chalk from 'chalk';
import { CONFIG } from '../config';

export class DependentsFetcher {
  constructor() {
  }

  async fetchPage(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    return html;
  }

  private async fetchWithRetry(url: string): Promise<string> {
    let lastError: any;
    
    for (let retry = 0; retry < CONFIG.HTTP.MAX_RETRIES; retry++) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': CONFIG.HTTP.USER_AGENT
          },
          timeout: CONFIG.HTTP.TIMEOUT
        });
        
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        if (error.response?.status === 429) {
          const waitTime = Math.pow(2, retry) * 1000;
          console.log(chalk.yellow(`Rate limited. Waiting ${waitTime / 1000} seconds...`));
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError;
  }
}