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

  displayTable(repositories: Repository[], latestDependents: Repository[], stats: DependentStats, entityType: string): void {
    if (repositories.length === 0) {
      console.log(chalk.yellow(`No ${entityType} found`));
      return;
    }

    // Display top repositories by stars
    console.log(chalk.bold.green(`\n🌟 Top ${entityType} by stars:`));
    const starsTable = new Table({
      head: ['URL', 'Stars'],
      style: {
        head: ['cyan']
      }
    });

    for (const repo of repositories) {
      starsTable.push([repo.url, formatStars(repo.stars)]);
    }

    console.log(starsTable.toString());

    // Display latest dependents
    console.log(chalk.bold.blue(`\n🕒 Latest ${entityType}:`));
    const latestTable = new Table({
      head: ['URL', 'Stars'],
      style: {
        head: ['blue']
      }
    });

    for (const repo of latestDependents) {
      latestTable.push([repo.url, formatStars(repo.stars)]);
    }

    console.log(latestTable.toString());

    if (stats.totalCount > 0) {
      console.log(chalk.gray(`\nFound ${stats.totalCount} ${entityType}, others are private`));
      console.log(chalk.gray(`Found ${stats.withStarsCount} ${entityType} with more than zero stars`));
    }
  }

  displayJson(repositories: Repository[], latestDependents: Repository[]): void {
    const result = {
      repositories,
      latestDependents
    };
    console.log(JSON.stringify(result, null, 2));
  }

  display(
    repositories: Repository[],
    latestDependents: Repository[],
    stats: DependentStats,
    entityType: string,
    format: 'table' | 'json'
  ): void {
    if (format === 'json') {
      this.displayJson(repositories, latestDependents);
    } else {
      this.displayTable(repositories, latestDependents, stats, entityType);
    }
  }
}