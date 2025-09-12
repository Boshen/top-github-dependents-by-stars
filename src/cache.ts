import NodeCache from 'node-cache';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

export class CacheManager {
  private memCache: NodeCache;
  private cacheDir: string;

  constructor() {
    // Memory cache with 24 hour TTL
    this.memCache = new NodeCache({ stdTTL: 86400 });
    
    // File cache directory
    this.cacheDir = path.join(os.homedir(), '.cache', 'top-github-dependents-by-stars');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheKey(url: string): string {
    return createHash('md5').update(url).digest('hex');
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  async get(url: string): Promise<any | null> {
    const key = this.getCacheKey(url);
    
    // Check memory cache first
    const memData = this.memCache.get(key);
    if (memData) {
      return memData;
    }

    // Check file cache
    const filePath = this.getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        const now = new Date().getTime();
        const fileAge = now - stats.mtime.getTime();
        
        // If file is less than 24 hours old
        if (fileAge < 86400000) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          // Store in memory cache for faster access
          this.memCache.set(key, data);
          return data;
        }
      } catch (error) {
        // If error reading cache, return null
      }
    }

    return null;
  }

  async set(url: string, data: any): Promise<void> {
    const key = this.getCacheKey(url);
    
    // Store in memory cache
    this.memCache.set(key, data);
    
    // Store in file cache
    const filePath = this.getCacheFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  }

  clearCache(): void {
    // Clear memory cache
    this.memCache.flushAll();
    
    // Clear file cache
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      });
    }
  }
}