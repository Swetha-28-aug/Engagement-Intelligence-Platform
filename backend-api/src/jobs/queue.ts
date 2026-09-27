import { Queue, Worker, Job } from 'bullmq';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = { url: REDIS_URL };

export const mentorAlertQueue = new Queue('mentor-alerts', { connection });
export const weeklyReportQueue = new Queue('weekly-reports', { connection });

export function createMentorAlertWorker(processor: (job: Job) => Promise<void>): Worker {
  const worker = new Worker('mentor-alerts', processor, { connection });
  worker.on('completed', (job) => { logger.info(`Mentor alert job ${job.id} completed`); });
  worker.on('failed', (job, err) => { logger.error(`Mentor alert job ${job?.id} failed:`, err); });
  return worker;
}
