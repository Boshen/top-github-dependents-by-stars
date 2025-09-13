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
 * // Token from GITHUB_TOKEN env var
 * const result = await getDependents('https://github.com/user/repo', {
 *   type: 'repositories',
 *   rows: 50,
 *   minStars: 10
 * });
 *
 * // Or provide token explicitly
 * const result = await getDependents('https://github.com/user/repo', {
 *   token: 'your-github-token',
 *   type: 'repositories'
 * });
 *
 * console.log(result.repositories);
 * console.log(result.stats);
 * ```
 */
export async function getDependents(
  repoUrl: string,
  options: ApiOptions = {}
): Promise<DependentsResult> {
  // Validate URL
  if (!repoUrl.startsWith('https://github.com/')) {
    throw new Error('Invalid GitHub repository URL. Must start with https://github.com/');
  }

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

  // We need to modify GhTopDep to return stats as well
  // For now, return the repositories
  const repositories = await ghtopdep.run(repoUrl);

  return {
    repositories,
    stats: {
      totalDependents: repositories.length,
      withStars: repositories.filter(r => r.stars > 0).length,
      fetchedRepos: repositories.length
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
 * const result1 = await client.getDependents('https://github.com/user/repo1');
 * const result2 = await client.getDependents('https://github.com/user/repo2');
 * ```
 */
export function createClient(defaultOptions: Partial<ApiOptions> = {}) {
  return {
    async getDependents(
      repoUrl: string,
      options?: Partial<ApiOptions>
    ): Promise<DependentsResult> {
      return getDependents(repoUrl, {
        ...defaultOptions,
        ...options,
        token: options?.token || defaultOptions.token
      });
    }
  };
}

// Re-export types for convenience
export { type Repository, DependentType } from './types';