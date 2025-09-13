import Table from 'cli-table3';
import chalk from 'chalk';
import { Repository, DependentStats } from '../types';
import { formatStars } from './formatters';

export class ResultsPresenter {
  displayProjectInfo(repoUrl: string, entityType: string, packageName?: string): void {
    // Extract owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    const repoName = match ? match[1] : repoUrl;

    console.log('\n' + chalk.bold.cyan('═'.repeat(50)));
    console.log(chalk.bold.cyan('Repository: ') + chalk.white(repoName));
    console.log(chalk.bold.cyan('Type: ') + chalk.white(entityType));
    if (packageName) {
      console.log(chalk.bold.cyan('Package: ') + chalk.white(packageName));
    }
    console.log(chalk.bold.cyan('═'.repeat(50)) + '\n');
  }

  displayTable(repositories: Repository[], stats: DependentStats, entityType: string): void {
    if (repositories.length === 0) {
      console.log(chalk.yellow(`No ${entityType} found`));
      return;
    }

    const table = new Table({
      head: ['URL', 'Stars'],
      style: {
        head: ['cyan']
      }
    });

    for (const repo of repositories) {
      table.push([repo.url, formatStars(repo.stars)]);
    }

    console.log(table.toString());

    if (stats.totalCount > 0) {
      console.log(chalk.gray(`\nFound ${stats.totalCount} ${entityType}, others are private`));
      console.log(chalk.gray(`Found ${stats.withStarsCount} ${entityType} with more than zero stars`));
    }
  }

  displayJson(repositories: Repository[]): void {
    console.log(JSON.stringify(repositories, null, 2));
  }

  display(
    repositories: Repository[], 
    stats: DependentStats, 
    entityType: string,
    format: 'table' | 'json'
  ): void {
    if (format === 'json') {
      this.displayJson(repositories);
    } else {
      this.displayTable(repositories, stats, entityType);
    }
  }
}