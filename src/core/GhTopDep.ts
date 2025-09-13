import chalk from 'chalk';
import { Repository, CliOptions, DependentType, DependentStats } from '../types';
import { sortRepos } from '../utils';
import { DependentsFetcher } from './DependentsFetcher';
import { PackageResolver } from './PackageResolver';
import { DependentsParser } from './DependentsParser';
import { ProgressTracker } from './ProgressTracker';
import { ResultsPresenter } from '../display/ResultsPresenter';

export class GhTopDep {
  private options: CliOptions;
  private fetcher: DependentsFetcher;
  private packageResolver: PackageResolver;
  private parser: DependentsParser;
  private progress: ProgressTracker;
  private presenter: ResultsPresenter;

  constructor(options: CliOptions) {
    this.options = options;
    
    // Initialize components
    this.fetcher = new DependentsFetcher();
    this.packageResolver = new PackageResolver(this.fetcher);
    this.parser = new DependentsParser();
    this.progress = new ProgressTracker();
    this.presenter = new ResultsPresenter();
  }

  async run(url: string): Promise<Repository[]> {
    const dependentType = this.options.repositories ? DependentType.REPOSITORY : DependentType.PACKAGE;
    const entityType = this.options.repositories ? 'repositories' : 'packages';

    // Build the initial URL
    const pageUrl = await this.buildDependentsUrl(url, dependentType);
    if (!pageUrl) return [];

    // Fetch all dependents
    const { repositories, stats } = await this.fetchAllDependents(pageUrl, url);

    // Sort and limit results
    const sortedRepos = sortRepos(repositories, this.options.rows);

    // Display results
    const format = this.options.table ? 'table' : 'json';
    if (format === 'table') {
      this.presenter.displayProjectInfo(url, entityType, this.options.packageName);
    }
    this.presenter.display(sortedRepos, stats, entityType, format);

    return sortedRepos;
  }

  private async buildDependentsUrl(repoUrl: string, dependentType: DependentType): Promise<string | null> {
    let baseUrl = `${repoUrl}/network/dependents?dependent_type=${dependentType}`;

    if (this.options.packageName) {
      console.log(chalk.cyan(`Looking for package: ${this.options.packageName}...`));

      // First, check if we're already on a filtered page
      const initialHtml = await this.fetcher.fetchPage(baseUrl);

      // Check if package filtering is available at all
      if (!this.packageResolver.hasPackageFilter(initialHtml)) {
        console.log(chalk.yellow(`Package filtering is not available for this repository.`));
        console.log(chalk.yellow(`The repository might not have multiple packages or package information.`));
        // Continue without package filtering
        return baseUrl;
      }

      // Check if already filtered by the desired package
      const isFiltered = await this.packageResolver.isAlreadyFilteredByPackage(
        initialHtml,
        this.options.packageName
      );

      if (isFiltered) {
        console.log(chalk.green(`Already on package "${this.options.packageName}" page!`));
        return baseUrl;
      }

      // If not already filtered, resolve the package ID
      const packageInfo = await this.packageResolver.resolvePackage(repoUrl, this.options.packageName);

      if (!packageInfo.id) {
        this.packageResolver.displayPackageNotFound(this.options.packageName, packageInfo.availablePackages);
        return null;
      }

      console.log(chalk.green(`Found package "${this.options.packageName}"!`));
      baseUrl = `${repoUrl}/network/dependents?package_id=${packageInfo.id}&dependent_type=${dependentType}`;
    }

    return baseUrl;
  }

  private async fetchAllDependents(
    initialUrl: string, 
    currentRepoUrl: string
  ): Promise<{ repositories: Repository[], stats: DependentStats }> {
    const allRepositories: Repository[] = [];
    const stats: DependentStats = {
      totalCount: 0,
      withStarsCount: 0
    };
    
    // Get total count for progress bar
    const firstPageHtml = await this.fetcher.fetchPage(initialUrl);
    const maxDeps = this.parser.parseDependentsCount(firstPageHtml);
    
    this.progress.start(maxDeps);
    
    let pageUrl: string | null = initialUrl;
    let processedCount = 0;
    
    while (pageUrl) {
      const html = pageUrl === initialUrl ? firstPageHtml : await this.fetcher.fetchPage(pageUrl);
      
      // Parse dependents from current page
      const { repositories, stats: pageStats } = this.parser.parseDependents(
        html, 
        this.options.minstar, 
        currentRepoUrl
      );
      
      allRepositories.push(...repositories);
      processedCount += pageStats.totalCount || 0;
      stats.totalCount += pageStats.totalCount || 0;
      stats.withStarsCount += pageStats.withStarsCount || 0;

      // Get next page URL
      pageUrl = this.parser.parseNextPageUrl(html);

      // Update progress - if this is the last page, set to 100%
      if (!pageUrl) {
        this.progress.update(maxDeps);
      } else {
        this.progress.update(Math.min(processedCount, maxDeps));
      }
    }

    this.progress.stop();
    
    return { repositories: allRepositories, stats };
  }
}