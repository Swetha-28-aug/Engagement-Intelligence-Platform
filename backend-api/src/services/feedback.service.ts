import prisma from '../lib/prisma';

export class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const FEEDBACK_INCLUDE = {
  session: { select: { id: true, title: true, scheduledDate: true, batchId: true } },
  student: { select: { id: true, name: true, email: true } },
  trainer: { select: { id: true, name: true, email: true } },
};

export interface FeedbackFilters {
  sessionId?: string;
  studentId?: string;
  trainerId?: string;
}

export async function listFeedback(filters: FeedbackFilters) {
  const where: Record<string, string> = {};
  if (filters.sessionId) where.sessionId = filters.sessionId;
  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.trainerId) where.trainerId = filters.trainerId;

  return prisma.feedback.findMany({
    where,
    include: FEEDBACK_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFeedbackById(id: string) {
  const record = await prisma.feedback.findUnique({
    where: { id },
    include: FEEDBACK_INCLUDE,
  });
  if (!record) throw new ServiceError('Feedback record not found.', 404);
  return record;
}

export async function createFeedback(
  sessionId: string,
  studentId: string,
  trainerId: string,
  effortRating: number,
  participationRating: number,
  comments?: string | null,
) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new ServiceError('Session not found.', 404);

  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) throw new ServiceError('Student not found.', 404);

  const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
  if (!trainer) throw new ServiceError('Trainer not found.', 404);

  const existing = await prisma.feedback.findFirst({
    where: { sessionId, studentId, trainerId },
  });
  if (existing) throw new ServiceError('Feedback already exists for this student in this session by this trainer.', 409);

  return prisma.feedback.create({
    data: { sessionId, studentId, trainerId, effortRating, participationRating, comments },
    include: FEEDBACK_INCLUDE,
  });
}

interface BulkFeedbackRecord {
  studentId: string;
  effortRating: number;
  participationRating: number;
  comments?: string | null;
}

export async function bulkCreateFeedback(
  sessionId: string,
  trainerId: string,
  records: BulkFeedbackRecord[],
) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new ServiceError('Session not found.', 404);

  const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
  if (!trainer) throw new ServiceError('Trainer not found.', 404);

  const created: any[] = [];
  const skipped: { studentId: string; reason: string }[] = [];

  for (const record of records) {
    const student = await prisma.user.findUnique({ where: { id: record.studentId } });
    if (!student) {
      skipped.push({ studentId: record.studentId, reason: 'Student not found' });
      continue;
    }

    const existing = await prisma.feedback.findFirst({
      where: { sessionId, studentId: record.studentId, trainerId },
    });
    if (existing) {
      skipped.push({ studentId: record.studentId, reason: 'Feedback already exists' });
      continue;
    }

    const fb = await prisma.feedback.create({
      data: {
        sessionId,
        studentId: record.studentId,
        trainerId,
        effortRating: record.effortRating,
        participationRating: record.participationRating,
        comments: record.comments,
      },
    });
    created.push(fb);
  }

  return { total: records.length, created: created.length, skipped };
}

export async function updateFeedback(
  id: string,
  data: { effortRating?: number; participationRating?: number; comments?: string | null },
) {
  const existing = await prisma.feedback.findUnique({ where: { id } });
  if (!existing) throw new ServiceError('Feedback record not found.', 404);

  return prisma.feedback.update({
    where: { id },
    data,
    include: FEEDBACK_INCLUDE,
  });
}

export async function deleteFeedback(id: string) {
  const existing = await prisma.feedback.findUnique({ where: { id } });
  if (!existing) throw new ServiceError('Feedback record not found.', 404);

  await prisma.feedback.delete({ where: { id } });
  return { message: 'Feedback record deleted.' };
}
