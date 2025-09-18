import { GhTopDep } from './core/GhTopDep';
import { Repository, CliOptions, DependentType } from './types';
import { CONFIG } from './config';

export interface ApiOptions {
  /**
   * GitHub personal access token for authentication
   * Defaults to GITHUB_TOKEN environment variable
   */
  token?: string;

  /**
   * Type of dependents to fetch
   * @default 'repositories'
   */
  type?: 'repositories' | 'packages';

  /**
   * Maximum number of results to return
   * @default 30
   */
  rows?: number;

  /**
   * Minimum number of stars for results
   * @default 0
   */
  minStars?: number;

  /**
   * Specific package name to query (optional)
   */
  packageName?: string;
}

export interface DependentsResult {
  /**
   * Array of dependent repositories sorted by stars
   */
  repositories: Repository[];

  /**
   * Array of latest dependent repositories (in GitHub's natural discovery order)
   */
  latestDependents: Repository[];

  /**
   * Statistics about the fetch operation
   */
  stats: {
    totalDependents: number;
    withStars: number;
    fetchedRepos: number;
  };
}

/**
 * Fetches GitHub dependents for a repository programmatically
 *
 * @example
 * ```typescript
 * import { getDependents } from 'top-github-dependents-by-stars';
 *
 * // Using owner/repo format
 * const result = await getDependents('facebook/react', {
 *   type: 'repositories',
 *   rows: 50,
 *   minStars: 10
 * });
 *
 * console.log(result.repositories);
 * console.log(result.stats);
 * ```
 */
export async function getDependents(
  repo: string,
  options: ApiOptions = {}
): Promise<DependentsResult> {
  // Validate and format repository input
  if (!repo.match(/^[\w-]+\/[\w.-]+$/)) {
    throw new Error('Invalid repository format. Use "owner/repo" format (e.g., "facebook/react")');
  }

  const repoUrl = `https://github.com/${repo}`;

  // Get token from options or environment variable
  const token = options.token || process.env.GITHUB_TOKEN;

  // Validate token
  if (!token) {
    throw new Error('GitHub token is required. Provide via options.token or set GITHUB_TOKEN environment variable');
  }

  // Build CLI options from API options
  const cliOptions: CliOptions = {
    repositories: options.type !== 'packages',
    table: false, // Not used in API mode
    rows: options.rows || CONFIG.DEFAULTS.ROWS,
    minstar: options.minStars || CONFIG.DEFAULTS.MIN_STARS,
    token: token,
    packageName: options.packageName
  };

  // Create instance and run
  const ghtopdep = new GhTopDep(cliOptions);

  // Get the result with both arrays and stats
  const result = await ghtopdep.run(repoUrl);

  return {
    repositories: result.repositories,
    latestDependents: result.latestDependents,
    stats: {
      totalDependents: result.stats.totalCount,
      withStars: result.stats.withStarsCount,
      fetchedRepos: result.repositories.length
    }
  };
}

/**
 * Creates a reusable GhTopDep client instance
 *
 * @example
 * ```typescript
 * import { createClient } from 'top-github-dependents-by-stars';
 *
 * // Token can be provided or will use GITHUB_TOKEN env var
 * const client = createClient({ token: 'your-github-token' });
 * // or
 * const client = createClient({}); // uses GITHUB_TOKEN env var
 *
 * const result1 = await client.getDependents('facebook/react');
 * const result2 = await client.getDependents('vuejs/vue');
 * ```
 */
export function createClient(defaultOptions: Partial<ApiOptions> = {}) {
  return {
    async getDependents(
      repo: string,
      options?: Partial<ApiOptions>
    ): Promise<DependentsResult> {
      return getDependents(repo, {
        ...defaultOptions,
        ...options,
        token: options?.token || defaultOptions.token
      });
    }
  };
}

// Re-export types for convenience
export { type Repository, DependentType } from './types';