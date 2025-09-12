#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { GhTopDep } from './ghtopdep';
import { CONSTANTS, CliOptions } from './types';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('top-github-dependents-by-stars')
  .description('CLI tool for sorting dependents repositories and packages by stars')
  .version(CONSTANTS.VERSION)
  .argument('<url>', 'GitHub repository URL')
  .option('--repositories', 'Sort repositories (default)', true)
  .option('--packages', 'Sort packages')
  .option('--table', 'Table view mode (default)', true)
  .option('--json', 'JSON output mode')
  .option('--report', 'Report to backend', false)
  .option('--description', 'Show description of packages or repositories', false)
  .option('--rows <number>', 'Number of repositories to show', String(CONSTANTS.DEFAULT_ROWS))
  .option('--minstar <number>', 'Minimum number of stars', String(CONSTANTS.DEFAULT_MINSTAR))
  .option('--search <query>', 'Search code in dependents')
  .requiredOption('--token <token>', 'GitHub token for authentication (required)', process.env.GHTOPDEP_TOKEN)
  .action(async (url: string, options: any) => {
    try {
      // Check if token is provided
      const token = options.token || process.env.GHTOPDEP_TOKEN;
      if (!token) {
        console.error(chalk.red('Error: GitHub token is required. Use --token or set GHTOPDEP_TOKEN environment variable'));
        process.exit(1);
      }

      // Parse options
      const cliOptions: CliOptions = {
        repositories: !options.packages,
        table: !options.json,
        report: options.report || false,
        description: options.description || false,
        rows: parseInt(options.rows, 10) || CONSTANTS.DEFAULT_ROWS,
        minstar: parseInt(options.minstar, 10) || CONSTANTS.DEFAULT_MINSTAR,
        search: options.search,
        token: token
      };

      // Validate URL
      if (!url.startsWith('https://github.com/')) {
        console.error(chalk.red('Error: Please provide a valid GitHub repository URL'));
        process.exit(1);
      }

      // Check for update notification (simplified version)
      if (process.env.NODE_ENV !== 'test') {
        // In a real implementation, we'd check for updates here
      }

      // Run the main logic
      const ghtopdep = new GhTopDep(cliOptions);
      await ghtopdep.run(url);
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();