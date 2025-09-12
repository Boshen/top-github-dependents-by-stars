import { Repository } from './types';

export function alreadyAdded(repoUrl: string, repos: Repository[]): boolean {
  return repos.some(repo => repo.url === repoUrl);
}

export function sortRepos(repos: Repository[], rows: number): Repository[] {
  return repos
    .sort((a, b) => b.stars - a.stars)
    .slice(0, rows);
}

export function humanize(num: number): string | number {
  if (num < 1000) {
    return num;
  } else if (num < 10000) {
    return `${Math.round(num / 100) / 10}K`;
  } else if (num < 1000000) {
    return `${Math.round(num / 1000)}K`;
  } else {
    return num;
  }
}

export function readableStars(repos: Repository[]): Repository[] {
  return repos.map(repo => ({
    ...repo,
    stars: humanize(repo.stars) as any
  }));
}

export function parseGitHubUrl(url: string): { owner: string; repository: string } {
  const urlObj = new URL(url);
  const [, owner, repository] = urlObj.pathname.split('/');
  return { owner, repository };
}

export function getBaseUrl(): string {
  const mode = process.env.GHTOPDEP_ENV;
  return mode === 'development' ? 'http://127.0.0.1:3000' : 'http://159.223.231.170';
}