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
}

export interface PaginationButton {
  href: string;
  text: string;
}

export const CONSTANTS = {
  PACKAGE_NAME: 'top-github-dependents-by-stars',
  GITHUB_URL: 'https://github.com',
  REPOS_PER_PAGE: 30,
  NEXT_BUTTON_SELECTOR: '#dependents > div.paginate-container > div > a',
  ITEM_SELECTOR: '#dependents > div.Box > div.flex-items-center',
  REPO_SELECTOR: 'span > a.text-bold',
  STARS_SELECTOR: 'div > span:nth-child(1)',
  DEPS_COUNT_SELECTOR: '.table-list-header-toggle .btn-link.selected',
  DEFAULT_ROWS: 10,
  DEFAULT_MINSTAR: 5,
  BASE_URL_PROD: 'http://159.223.231.170',
  BASE_URL_DEV: 'http://127.0.0.1:3000',
  VERSION: '0.0.0'
};