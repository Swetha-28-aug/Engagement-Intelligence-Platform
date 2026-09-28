import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
  createFeedbackSchema,
  bulkCreateFeedbackSchema,
  updateFeedbackSchema,
} from '../validators/feedback.validator';
import {
  listFeedbackHandler,
  getFeedbackHandler,
  createFeedbackHandler,
  bulkCreateFeedbackHandler,
  updateFeedbackHandler,
  deleteFeedbackHandler,
} from '../controllers/feedback.controller';

const router = Router();

router.get('/', listFeedbackHandler);

router.get('/:id', getFeedbackHandler);

router.post('/', validate(createFeedbackSchema), createFeedbackHandler);

router.post('/bulk', validate(bulkCreateFeedbackSchema), bulkCreateFeedbackHandler);

router.put('/:id', validate(updateFeedbackSchema), updateFeedbackHandler);

router.delete('/:id', deleteFeedbackHandler);

export default router;
