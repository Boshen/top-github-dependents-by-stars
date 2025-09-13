import Table from 'cli-table3';
import chalk from 'chalk';
import { Repository, DependentStats } from '../types';
import { formatStars } from './formatters';

export class ResultsPresenter {
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
      console.log(chalk.gray(`found ${stats.totalCount} ${entityType}, others are private`));
      console.log(chalk.gray(`found ${stats.withStarsCount} ${entityType} with more than zero stars`));
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