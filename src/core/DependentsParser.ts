import * as cheerio from 'cheerio';
import { Repository, DependentStats } from '../types';
import { SELECTORS, CONFIG } from '../config';

export class DependentsParser {
  parseDependentsCount(html: string): number {
    const $ = cheerio.load(html);
    const depsCountElement = $(SELECTORS.DEPS_COUNT);
    const text = depsCountElement.text().trim();
    const match = text.match(/[\d,]+/);
    
    if (match) {
      return parseInt(match[0].replace(/,/g, ''), 10);
    }
    
    return 0;
  }

  parseDependents(html: string, minStars: number, currentRepoUrl: string): {
    repositories: Repository[];
    stats: Partial<DependentStats>;
  } {
    const $ = cheerio.load(html);
    const repositories: Repository[] = [];
    let withStarsCount = 0;
    
    const dependents = $(SELECTORS.DEPENDENT_ITEM).toArray();
    
    for (const dep of dependents) {
      const $dep = $(dep);
      const starsElement = $dep.find(SELECTORS.STARS);
      
      if (starsElement.length === 0) {
        continue; // Private or inaccessible repository
      }
      
      const starsText = starsElement.first().text().trim();
      const stars = parseInt(starsText.replace(/,/g, ''), 10);
      
      if (stars > 0) {
        withStarsCount++;
      }
      
      if (stars >= minStars) {
        const repoLink = $dep.find(SELECTORS.REPO_LINK).first();
        const relativeUrl = repoLink.attr('href');
        
        if (relativeUrl) {
          const repoUrl = `${CONFIG.GITHUB.BASE_URL}${relativeUrl}`;
          
          // Skip self-reference and duplicates
          if (repoUrl !== currentRepoUrl && !this.isDuplicate(repoUrl, repositories)) {
            repositories.push({ url: repoUrl, stars });
          }
        }
      }
    }
    
    return {
      repositories,
      stats: {
        totalCount: dependents.length,
        withStarsCount
      }
    };
  }

  parseNextPageUrl(html: string): string | null {
    const $ = cheerio.load(html);
    const paginationButtons = $(SELECTORS.NEXT_BUTTON).toArray();
    
    if (paginationButtons.length === 2) {
      // Both Previous and Next buttons exist
      const nextButton = $(paginationButtons[1]);
      return nextButton.attr('href') || null;
    } else if (paginationButtons.length === 1) {
      const button = $(paginationButtons[0]);
      const buttonText = button.text();
      if (buttonText === 'Next') {
        return button.attr('href') || null;
      }
    }
    
    return null;
  }

  private isDuplicate(url: string, repositories: Repository[]): boolean {
    return repositories.some(repo => repo.url === url);
  }
}