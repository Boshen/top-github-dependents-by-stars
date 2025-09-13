import cliProgress from 'cli-progress';
import { CONFIG } from '../config';

export class ProgressTracker {
  private progressBar: cliProgress.SingleBar | null = null;

  start(total: number): void {
    if (total <= 0) return;

    this.progressBar = new cliProgress.SingleBar({
      format: CONFIG.PROGRESS.FORMAT,
      barCompleteChar: CONFIG.PROGRESS.BAR_COMPLETE_CHAR,
      barIncompleteChar: CONFIG.PROGRESS.BAR_INCOMPLETE_CHAR,
      hideCursor: true
    });
    
    this.progressBar.start(total, 0);
  }

  update(value: number): void {
    if (this.progressBar) {
      this.progressBar.update(value);
    }
  }

  stop(): void {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }
}