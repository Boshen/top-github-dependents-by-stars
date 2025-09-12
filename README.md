# ghtopdep - TypeScript Implementation

A TypeScript port of [ghtopdep](https://github.com/github-tooling/ghtopdep) - CLI tool for sorting GitHub repository dependents by stars.

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
pnpm install -g ghtopdep
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
ghtopdep https://github.com/owner/repo
```

With options:

```bash
# Show top 20 repositories with at least 10 stars
ghtopdep https://github.com/facebook/react --rows 20 --minstar 10

# Include descriptions (requires token)
ghtopdep https://github.com/facebook/react --description --token YOUR_GITHUB_TOKEN

# Output as JSON
ghtopdep https://github.com/facebook/react --json

# Search for specific code in dependents
ghtopdep https://github.com/facebook/react --search "useState" --token YOUR_GITHUB_TOKEN

# Sort packages instead of repositories
ghtopdep https://github.com/npm/cli --packages
```

## Options

- `--repositories` / `--packages` - Sort repositories or packages (default: repositories)
- `--table` / `--json` - Output format (default: table)
- `--description` - Show repository descriptions (requires token)
- `--rows <number>` - Number of repositories to show (default: 10)
- `--minstar <number>` - Minimum number of stars (default: 5)
- `--search <query>` - Search code in dependents (requires token)
- `--token <token>` - GitHub authentication token
- `--report` - Report results to backend service

## Environment Variables

- `GHTOPDEP_TOKEN` - GitHub token for authentication
- `GHTOPDEP_ENV` - Set to "development" for local backend

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