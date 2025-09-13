import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { Repository, CliOptions, DependentType, DependentStats } from '../types';
import { parseGitHubUrl, sortRepos } from '../utils';
import { CONFIG } from '../config';
import { DependentsFetcher } from './DependentsFetcher';
import { PackageResolver } from './PackageResolver';
import { DependentsParser } from './DependentsParser';
import { ProgressTracker } from './ProgressTracker';
import { ResultsPresenter } from '../display/ResultsPresenter';

export class GhTopDep {
  private octokit: Octokit;
  private options: CliOptions;
  private fetcher: DependentsFetcher;
  private packageResolver: PackageResolver;
  private parser: DependentsParser;
  private progress: ProgressTracker;
  private presenter: ResultsPresenter;

  constructor(options: CliOptions) {
    this.options = options;
    this.octokit = new Octokit({ auth: options.token });
    
    // Initialize components
    this.fetcher = new DependentsFetcher();
    this.packageResolver = new PackageResolver(this.fetcher);
    this.parser = new DependentsParser();
    this.progress = new ProgressTracker();
    this.presenter = new ResultsPresenter();
  }

  async run(url: string): Promise<Repository[]> {
    const { owner, repository } = parseGitHubUrl(url);
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
    this.presenter.display(sortedRepos, stats, entityType, format);
    
    return sortedRepos;
  }

  private async buildDependentsUrl(repoUrl: string, dependentType: DependentType): Promise<string | null> {
    let baseUrl = `${repoUrl}/network/dependents?dependent_type=${dependentType}`;
    
    if (this.options.packageName) {
      console.log(chalk.cyan(`Looking for package: ${this.options.packageName}...`));
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
      
      // Update progress
      this.progress.update(Math.min(processedCount, maxDeps));
      
      // Get next page URL
      pageUrl = this.parser.parseNextPageUrl(html);
    }
    
    this.progress.stop();
    
    return { repositories: allRepositories, stats };
  }
}