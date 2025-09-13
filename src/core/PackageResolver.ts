import * as cheerio from 'cheerio';
import chalk from 'chalk';
import { PackageInfo } from '../types';
import { SELECTORS } from '../config';
import { DependentsFetcher } from './DependentsFetcher';

export class PackageResolver {
  private fetcher: DependentsFetcher;

  constructor(fetcher: DependentsFetcher) {
    this.fetcher = fetcher;
  }

  hasPackageFilter(html: string): boolean {
    const $ = cheerio.load(html);
    const filterSummary = $(SELECTORS.PACKAGE_FILTER_SUMMARY);
    return filterSummary.length > 0;
  }

  async isAlreadyFilteredByPackage(html: string, packageName: string): Promise<boolean> {
    const $ = cheerio.load(html);
    const filterSummary = $(SELECTORS.PACKAGE_FILTER_SUMMARY);

    if (filterSummary.length > 0) {
      const summaryText = filterSummary.text().trim();
      // Check if the summary contains the package name
      return summaryText.includes(packageName);
    }

    return false;
  }

  async resolvePackage(repoUrl: string, packageName: string): Promise<PackageInfo> {
    const html = await this.fetcher.fetchPage(`${repoUrl}/network/dependents`);
    const $ = cheerio.load(html);
    
    const packageOptions = $(SELECTORS.PACKAGE_OPTION);
    const availablePackages: string[] = [];
    let packageId: string | null = null;

    packageOptions.each((_, elem) => {
      const $elem = $(elem);
      const pkgName = $elem.find(SELECTORS.PACKAGE_NAME).text().trim();
      
      if (pkgName) {
        availablePackages.push(pkgName);
        
        if (pkgName === packageName) {
          const href = $elem.attr('href');
          if (href) {
            const match = href.match(/package_id=([^&]+)/);
            if (match) {
              packageId = match[1];
            }
          }
        }
      }
    });

    return { id: packageId, availablePackages };
  }

  displayPackageNotFound(packageName: string, availablePackages: string[]): void {
    console.error(chalk.red(`Package "${packageName}" not found`));
    
    if (availablePackages.length > 0) {
      console.log(chalk.yellow('\nAvailable packages:'));
      availablePackages.forEach(pkg => {
        console.log(chalk.gray(`  - ${pkg}`));
      });
    } else {
      console.log(chalk.yellow('No packages found for this repository'));
    }
  }
}