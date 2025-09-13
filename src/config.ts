export const CONFIG = {
  HTTP: {
    USER_AGENT: 'top-github-dependents-by-stars/0.0.0',
    TIMEOUT: 30000,
    MAX_RETRIES: 15,
  },
  
  DEFAULTS: {
    ROWS: 10,
    MIN_STARS: 5,
  },
  
  GITHUB: {
    BASE_URL: 'https://github.com',
  },
  
  PROGRESS: {
    FORMAT: 'Progress |{bar}| {percentage}% | {value}/{total} Dependencies',
    BAR_COMPLETE_CHAR: '\u2588',
    BAR_INCOMPLETE_CHAR: '\u2591',
  },
};

export const SELECTORS = {
  DEPS_COUNT: '.table-list-header-toggle .btn-link.selected',
  NEXT_BUTTON: '#dependents > div.paginate-container > div > a',
  DEPENDENT_ITEM: '#dependents > div.Box > div.flex-items-center',
  REPO_LINK: 'span > a.text-bold',
  STARS: 'div > span:nth-child(1)',
  PACKAGE_OPTION: 'a.select-menu-item[href*="package_id"]',
  PACKAGE_NAME: '.select-menu-item-text',
};