// Export programmatic API
export { getDependents, createClient, type ApiOptions, type DependentsResult, type Repository, DependentType } from './api';

// CLI entry point when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./cli.js');
}