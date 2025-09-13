# top-github-dependents-by-stars

A TypeScript implementation of a CLI tool for sorting GitHub repository dependents by stars. Based on [ghtopdep](https://github.com/github-tooling/ghtopdep).

## Features

- Sort repository dependents by star count
- Support for both repositories and packages
- Table and JSON output modes
- Optional repository descriptions (requires GitHub token)
- Search code across dependent repositories
- Caching for improved performance
- Progress bar for large dependency lists

## Installation

```bash
pnpm install -g top-github-dependents-by-stars
```

Or run locally:

```bash
pnpm install
pnpm run build
pnpm start -- <github-repo-url>
```

## Usage

Basic usage:

```bash
top-github-dependents-by-stars https://github.com/owner/repo
```

With options:

```bash
# Show top 20 repositories with at least 10 stars
top-github-dependents-by-stars https://github.com/facebook/react --rows 20 --minstar 10

# Include descriptions (requires token)
top-github-dependents-by-stars https://github.com/facebook/react --description --token YOUR_GITHUB_TOKEN

# Output as JSON
top-github-dependents-by-stars https://github.com/facebook/react --json

# Search for specific code in dependents
top-github-dependents-by-stars https://github.com/facebook/react --search "useState" --token YOUR_GITHUB_TOKEN

# Sort packages instead of repositories
top-github-dependents-by-stars https://github.com/npm/cli --packages
```

## Options

- `--repositories` / `--packages` - Sort repositories or packages (default: repositories)
- `--table` / `--json` - Output format (default: table)
- `--rows <number>` - Number of repositories to show (default: 10)
- `--minstar <number>` - Minimum number of stars (default: 5)
- `--token <token>` - GitHub authentication token

## Environment Variables

- `GHTOPDEP_TOKEN` - GitHub token for authentication

## Development

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Watch mode
pnpm run dev

# Run locally
pnpm start -- https://github.com/owner/repo
```

## Differences from Python Version

This TypeScript implementation maintains feature parity with the original Python version, with some improvements:

- Uses modern TypeScript with full type safety
- Leverages pnpm/npm ecosystem for dependencies
- Improved error handling and user feedback
- Consistent code style and structure

## License

MIT