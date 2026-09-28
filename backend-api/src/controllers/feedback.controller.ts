import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import {
  ServiceError,
  listFeedback,
  getFeedbackById,
  createFeedback,
  bulkCreateFeedback,
  updateFeedback,
  deleteFeedback,
} from '../services/feedback.service';

function handleServiceError(err: unknown, res: Response, next: NextFunction) {
  if (err instanceof ServiceError) {
    return sendError(res, err.message, err.statusCode);
  }
  next(err);
}

export async function listFeedbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: { sessionId?: string; studentId?: string; trainerId?: string } = {};
    if (req.query.sessionId) filters.sessionId = String(req.query.sessionId);
    if (req.query.studentId) filters.studentId = String(req.query.studentId);
    if (req.query.trainerId) filters.trainerId = String(req.query.trainerId);
    const result = await listFeedback(filters);
    return sendSuccess(res, result);
  } catch (err) {
    return handleServiceError(err, res, next);
  }
}

export async function getFeedbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getFeedbackById(String(req.params.id));
    return sendSuccess(res, result);
  } catch (err) {
    return handleServiceError(err, res, next);
  }
}

export async function createFeedbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user!.sub;
    const { sessionId, studentId, effortRating, participationRating, comments } = req.body;
    const result = await createFeedback(sessionId, studentId, trainerId, effortRating, participationRating, comments);
    return sendSuccess(res, result, 201);
  } catch (err) {
    return handleServiceError(err, res, next);
  }
}

export async function bulkCreateFeedbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user!.sub;
    const { sessionId, records } = req.body;
    const result = await bulkCreateFeedback(sessionId, trainerId, records);
    return sendSuccess(res, result, result.skipped.length > 0 ? 207 : 201);
  } catch (err) {
    return handleServiceError(err, res, next);
  }
}

export async function updateFeedbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await updateFeedback(String(req.params.id), req.body);
    return sendSuccess(res, result);
  } catch (err) {
    return handleServiceError(err, res, next);
  }
}

export async function deleteFeedbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteFeedback(String(req.params.id));
    return sendSuccess(res, result);
  } catch (err) {
    return handleServiceError(err, res, next);
  }
}
