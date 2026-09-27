import { Job } from 'bullmq';
import { logger } from '../utils/logger';

export async function processWeeklyReportJob(_job: Job): Promise<void> {
  logger.info('Weekly report job — placeholder for Module 13');
}
