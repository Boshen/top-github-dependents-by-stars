import axios from 'axios';
import * as cheerio from 'cheerio';
import { Octokit } from '@octokit/rest';
import Table from 'cli-table3';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import { Repository, CliOptions, CONSTANTS } from './types';
import { alreadyAdded, sortRepos, readableStars, parseGitHubUrl } from './utils';
import { CacheManager } from './cache';

export class GhTopDep {
  private cache: CacheManager;
  private octokit: Octokit;
  private options: CliOptions;

  constructor(options: CliOptions) {
    this.options = options;
    this.cache = new CacheManager();

    // Always initialize Octokit since token is required
    this.octokit = new Octokit({
      auth: options.token
    });
  }

  private async fetchPage(url: string): Promise<string> {
    // Check cache first
    const cached = await this.cache.get(url);
    if (cached) {
      return cached;
    }

    // Fetch with retry logic
    const maxRetries = 15;
    let retries = 0;
    let lastError: any;

    while (retries < maxRetries) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'top-github-dependents-by-stars/0.0.0'
          },
          timeout: 30000
        });

        // Cache the response
        await this.cache.set(url, response.data);
        return response.data;
      } catch (error: any) {
        lastError = error;
        if (error.response?.status === 429) {
          // Rate limited, wait exponentially
          const waitTime = Math.pow(2, retries) * 1000;
          console.log(chalk.yellow(`Rate limited. Waiting ${waitTime / 1000} seconds...`));
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        retries++;
      }
    }

    throw lastError;
  }


  private async getMaxDeps(url: string): Promise<number> {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);

    const depsCountElement = $(CONSTANTS.DEPS_COUNT_SELECTOR);
    const text = depsCountElement.text().trim();
    const match = text.match(/[\d,]+/);

    if (match) {
      return parseInt(match[0].replace(/,/g, ''), 10);
    }

    return 0;
  }

  private async extractPackageId(url: string, packageName: string): Promise<{ id: string | null, availablePackages: string[] }> {
    const html = await this.fetchPage(url + '/network/dependents');
    const $ = cheerio.load(html);

    // Find all package options in the select menu
    const packageOptions = $('a.select-menu-item[href*="package_id"]');
    const availablePackages: string[] = [];
    let packageId: string | null = null;

    for (let i = 0; i < packageOptions.length; i++) {
      const elem = packageOptions[i];
      const $elem = $(elem);

      // Get the package name from the span
      const pkgName = $elem.find('.select-menu-item-text').text().trim();
      
      if (pkgName) {
        availablePackages.push(pkgName);
        
        if (pkgName === packageName) {
          // Extract package_id from href
          const href = $elem.attr('href');
          if (href) {
            const match = href.match(/package_id=([^&]+)/);
            if (match) {
              packageId = match[1];
            }
          }
        }
      }
    }

    return { id: packageId, availablePackages };
  }

  async run(url: string): Promise<Repository[]> {
    const { owner, repository } = parseGitHubUrl(url);
    const destination = this.options.repositories ? 'REPOSITORY' : 'PACKAGE';
    const destinations = this.options.repositories ? 'repositories' : 'packages';


    // Token is now always available, no need to check
    const repos: Repository[] = [];
    let moreThanZeroCount = 0;
    let totalReposCount = 0;

    let pageUrl = `${url}/network/dependents?dependent_type=${destination}`;

    // If package name is specified, extract package ID and update URL
    if (this.options.packageName) {
      console.log(chalk.cyan(`Looking for package: ${this.options.packageName}...`));
      const { id: packageId, availablePackages } = await this.extractPackageId(url, this.options.packageName);

      if (!packageId) {
        console.error(chalk.red(`Package "${this.options.packageName}" not found`));
        
        if (availablePackages.length > 0) {
          console.log(chalk.yellow('\nAvailable packages:'));
          availablePackages.forEach(pkg => {
            console.log(chalk.gray(`  - ${pkg}`));
          });
        } else {
          console.log(chalk.yellow('No packages found for this repository'));
        }
        
        return [];
      }

      console.log(chalk.green(`Found package "${this.options.packageName}"!`));
      pageUrl = `${url}/network/dependents?package_id=${packageId}&dependent_type=${destination}`;
    }

    // Get total dependencies count for progress bar
    const maxDeps = await this.getMaxDeps(pageUrl);

    // Create progress bar
    const progressBar = new cliProgress.SingleBar({
      format: 'Progress |{bar}| {percentage}% | {value}/{total} Dependencies',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    if (maxDeps > 0) {
      progressBar.start(maxDeps, 0);
    }

    while (true) {
      const html = await this.fetchPage(pageUrl);
      const $ = cheerio.load(html);

      const dependents = $(CONSTANTS.ITEM_SELECTOR).toArray();
      totalReposCount += dependents.length;

      for (const dep of dependents) {
        const $dep = $(dep);
        const repoStarsList = $dep.find(CONSTANTS.STARS_SELECTOR);

        if (repoStarsList.length === 0) {
          continue; // Private or ghost package
        }

        const repoStarsText = repoStarsList.first().text().trim();
        const repoStarsNum = parseInt(repoStarsText.replace(/,/g, ''), 10);

        if (repoStarsNum !== 0) {
          moreThanZeroCount++;
        }

        if (repoStarsNum >= this.options.minstar) {
          const repoLink = $dep.find(CONSTANTS.REPO_SELECTOR).first();
          const relativeRepoUrl = repoLink.attr('href');

          if (!relativeRepoUrl) continue;

          const repoUrl = `${CONSTANTS.GITHUB_URL}${relativeRepoUrl}`;

          // Check if not already added and not the same repo
          if (!alreadyAdded(repoUrl, repos) && repoUrl !== url) {
            const repo: Repository = {
              url: repoUrl,
              stars: repoStarsNum
            };


            repos.push(repo);
          }
        }
      }

      // Update progress
      if (maxDeps > 0) {
        progressBar.update(Math.min(totalReposCount, maxDeps));
      }

      // Check for next page
      const paginationButtons = $(CONSTANTS.NEXT_BUTTON_SELECTOR).toArray();

      if (paginationButtons.length === 2) {
        // There's both Previous and Next
        const nextButton = $(paginationButtons[1]);
        pageUrl = nextButton.attr('href') || '';
      } else if (paginationButtons.length === 1) {
        const button = $(paginationButtons[0]);
        const buttonText = button.text();
        if (buttonText === 'Next') {
          pageUrl = button.attr('href') || '';
        } else {
          // Only Previous button, we're done
          break;
        }
      } else {
        // No pagination buttons, we're done
        break;
      }

      if (!pageUrl) {
        break;
      }
    }

    if (maxDeps > 0) {
      progressBar.stop();
    }


    const sortedRepos = sortRepos(repos, this.options.rows);

    this.displayResults(sortedRepos, totalReposCount, moreThanZeroCount, destinations);

    return sortedRepos;
  }


  private displayResults(
    repos: Repository[],
    totalReposCount: number,
    moreThanZeroCount: number,
    destinations: string
  ): void {
    if (this.options.table) {
      if (repos.length > 0) {
        const readableRepos = readableStars(repos);

        // Create table
        const table = new Table({
          head: ['URL', 'Stars'],
          style: {
            head: ['cyan']
          }
        });

        for (const repo of readableRepos) {
          table.push([repo.url, repo.stars]);
        }

        console.log(table.toString());

        if (totalReposCount > 0) {
          console.log(chalk.gray(`found ${totalReposCount} ${destinations} others ${destinations} are private`));
          console.log(chalk.gray(`found ${moreThanZeroCount} ${destinations} with more than zero star`));
        }
      } else {
        console.log(chalk.yellow(`No ${destinations} found`));
      }
    } else {
      // JSON output
      console.log(JSON.stringify(repos, null, 2));
    }
  }
}
