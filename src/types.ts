export interface Repository {
  url: string;
  stars: number;
}

export interface CliOptions {
  repositories: boolean;
  table: boolean;
  rows: number;
  minstar: number;
  token: string;
  packageName?: string;
}

export enum DependentType {
  REPOSITORY = 'REPOSITORY',
  PACKAGE = 'PACKAGE'
}

export interface PackageInfo {
  id: string | null;
  availablePackages: string[];
}

export interface DependentStats {
  totalCount: number;
  withStarsCount: number;
}

export interface GitHubRepo {
  owner: string;
  repository: string;
}

export const APP_INFO = {
  NAME: 'top-github-dependents-by-stars',
  VERSION: '0.0.0'
};
