import { Repository, GitHubRepo } from './types';

export function sortRepos(repos: Repository[], limit: number): Repository[] {
  return repos
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit);
}

export function parseGitHubUrl(url: string): GitHubRepo {
  const urlObj = new URL(url);
  const [, owner, repository] = urlObj.pathname.split('/');
  return { owner, repository };
}