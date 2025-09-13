# top-github-dependents-by-stars

A CLI tool and API for sorting GitHub repository dependents by stars. Find out which popular projects depend on your repository!

## Features

- 📊 Sort repository dependents by star count
- 📦 Support for both repositories and packages
- 🔍 Query specific package dependencies by name
- 📋 Table and JSON output modes
- ⚡ Built-in caching for improved performance
- 📈 Progress bar for large dependency lists
- 🔧 Programmatic API for integration

## Usage

### CLI

Basic usage (requires GitHub token due to GitHub rate limit):

```bash
# Set your GitHub token (required)
export GITHUB_TOKEN=your_github_token

# Use owner/repo format
pnpm dlx top-github-dependents-by-stars facebook/react

# Show top 20 repositories with at least 10 stars
pnpm dlx top-github-dependents-by-stars facebook/react --rows 20 --minstar 10

# Output as JSON
pnpm dlx top-github-dependents-by-stars facebook/react --json

# Sort packages instead of repositories
pnpm dlx top-github-dependents-by-stars npm/cli --packages

# Query specific package dependencies
pnpm dlx top-github-dependents-by-stars oxc-project/oxc --package oxlint
```

### Programmatic API

```typescript
import { getDependents, createClient } from 'top-github-dependents-by-stars';

// Using getDependents directly (uses GITHUB_TOKEN env var)
const result = await getDependents('facebook/react', {
  type: 'repositories',
  rows: 50,
  minStars: 10
});

console.log(result.repositories); // Array of dependent repos
console.log(result.stats);        // Statistics about the fetch

// Or create a reusable client
const client = createClient({ token: 'your-github-token' });

const result1 = await client.getDependents('facebook/react');
const result2 = await client.getDependents('vuejs/vue');
```

## Options

### CLI Options

- `--repositories` / `--packages` - Sort repositories or packages (default: repositories)
- `--table` / `--json` - Output format (default: table)
- `--rows <number>` - Number of repositories to show (default: 10)
- `--minstar <number>` - Minimum number of stars (default: 5)
- `--package <name>` - Query specific package dependencies
- `--token <token>` - GitHub authentication token (can also use GITHUB_TOKEN env var)

### API Options

```typescript
interface ApiOptions {
  token?: string;        // GitHub token (defaults to GITHUB_TOKEN env var)
  type?: 'repositories' | 'packages';  // Type of dependents (default: 'repositories')
  rows?: number;         // Max results to return (default: 30)
  minStars?: number;     // Minimum stars filter (default: 0)
  packageName?: string;  // Specific package to query
}
```

## Environment Variables

- `GITHUB_TOKEN` - GitHub token for authentication

## Authentication

A GitHub personal access token is required. You can create one at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens).

The token needs the `public_repo` scope for public repositories.

## Development

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Run locally
GITHUB_TOKEN=your_token node dist/cli.js facebook/react
```

## Credits

* https://github.com/andriyor/ghtopdep/

## License

MIT
