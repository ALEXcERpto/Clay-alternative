import { ValidationJob } from '../types';

// In-memory storage for validation jobs
class JobStore {
  private jobs: Map<string, ValidationJob> = new Map();

  set(jobId: string, job: ValidationJob): void {
    this.jobs.set(jobId, job);
  }

  get(jobId: string): ValidationJob | undefined {
    return this.jobs.get(jobId);
  }

  delete(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  has(jobId: string): boolean {
    return this.jobs.has(jobId);
  }

  // Auto-cleanup jobs older than 1 hour
  cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < oneHourAgo) {
        this.jobs.delete(jobId);
      }
    }
  }
}

export const jobStore = new JobStore();

// Run cleanup every 30 minutes
setInterval(() => {
  jobStore.cleanup();
}, 30 * 60 * 1000);
