#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { GhTopDep } from './core/GhTopDep';
import { CliOptions, APP_INFO } from './types';
import { CONFIG } from './config';

dotenv.config();

function parseCliOptions(options: any): CliOptions {
  const token = options.token || process.env.GITHUB_TOKEN || process.env.GHTOPDEP_TOKEN;

  if (!token) {
    console.error(chalk.red('Error: GitHub token is required. Use --token or set GITHUB_TOKEN environment variable'));
    process.exit(1);
  }

  return {
    repositories: !options.packages,
    table: !options.json,
    rows: parseInt(options.rows, 10) || CONFIG.DEFAULTS.ROWS,
    minstar: parseInt(options.minstar, 10) || CONFIG.DEFAULTS.MIN_STARS,
    token: token,
    packageName: options.package
  };
}

function validateUrl(url: string): void {
  if (!url.startsWith('https://github.com/')) {
    console.error(chalk.red('Error: Please provide a valid GitHub repository URL'));
    process.exit(1);
  }
}

const program = new Command();

program
  .name(APP_INFO.NAME)
  .description('CLI tool for sorting dependents repositories and packages by stars')
  .version(APP_INFO.VERSION)
  .argument('<url>', 'GitHub repository URL')
  .option('--repositories', 'Sort repositories (default)', true)
  .option('--packages', 'Sort packages')
  .option('--table', 'Table view mode (default)', true)
  .option('--json', 'JSON output mode')
  .option('--rows <number>', 'Number of repositories to show', String(CONFIG.DEFAULTS.ROWS))
  .option('--minstar <number>', 'Minimum number of stars', String(CONFIG.DEFAULTS.MIN_STARS))
  .option('--package <name>', 'Query specific package dependencies')
  .requiredOption('--token <token>', 'GitHub token for authentication (required)', process.env.GITHUB_TOKEN || process.env.GHTOPDEP_TOKEN)
  .action(async (url: string, options: any) => {
    try {
      validateUrl(url);
      const cliOptions = parseCliOptions(options);

      const ghtopdep = new GhTopDep(cliOptions);
      await ghtopdep.run(url);
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();