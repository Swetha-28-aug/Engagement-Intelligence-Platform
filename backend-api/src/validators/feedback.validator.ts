import Joi from 'joi';

export const createFeedbackSchema = Joi.object({
  sessionId: Joi.string().uuid().required()
    .messages({ 'string.guid': 'sessionId must be a valid UUID' }),
  studentId: Joi.string().uuid().required()
    .messages({ 'string.guid': 'studentId must be a valid UUID' }),
  effortRating: Joi.number().integer().min(1).max(5).required()
    .messages({ 'number.min': 'effortRating must be between 1 and 5', 'number.max': 'effortRating must be between 1 and 5' }),
  participationRating: Joi.number().integer().min(1).max(5).required()
    .messages({ 'number.min': 'participationRating must be between 1 and 5', 'number.max': 'participationRating must be between 1 and 5' }),
  comments: Joi.string().max(2000).allow('', null).optional(),
});

export const bulkCreateFeedbackSchema = Joi.object({
  sessionId: Joi.string().uuid().required()
    .messages({ 'string.guid': 'sessionId must be a valid UUID' }),
  records: Joi.array().items(
    Joi.object({
      studentId: Joi.string().uuid().required()
        .messages({ 'string.guid': 'studentId must be a valid UUID' }),
      effortRating: Joi.number().integer().min(1).max(5).required(),
      participationRating: Joi.number().integer().min(1).max(5).required(),
      comments: Joi.string().max(2000).allow('', null).optional(),
    })
  ).min(1).required()
    .messages({ 'array.min': 'At least one feedback record is required' }),
});

export const updateFeedbackSchema = Joi.object({
  effortRating: Joi.number().integer().min(1).max(5).optional()
    .messages({ 'number.min': 'effortRating must be between 1 and 5', 'number.max': 'effortRating must be between 1 and 5' }),
  participationRating: Joi.number().integer().min(1).max(5).optional()
    .messages({ 'number.min': 'participationRating must be between 1 and 5', 'number.max': 'participationRating must be between 1 and 5' }),
  comments: Joi.string().max(2000).allow('', null).optional(),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});
