import {
  createFeedbackSchema,
  bulkCreateFeedbackSchema,
  updateFeedbackSchema,
} from '../validators/feedback.validator';

function isValid(schema: any, data: any): boolean {
  const { error } = schema.validate(data, { abortEarly: false });
  return !error;
}

function getErrors(schema: any, data: any): string {
  const { error } = schema.validate(data, { abortEarly: false });
  return error ? error.details.map((d: any) => d.message).join(' ') : '';
}

const UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID2 = 'b1ffcd00-0d1c-4ef9-bb7e-7cc0ce491b22';

describe('createFeedbackSchema', () => {
  const valid = {
    sessionId: UUID,
    studentId: UUID2,
    effortRating: 4,
    participationRating: 3,
    comments: 'Good work',
  };

  it('accepts valid input', () => {
    expect(isValid(createFeedbackSchema, valid)).toBe(true);
  });

  it('accepts without comments', () => {
    const { comments, ...rest } = valid;
    expect(isValid(createFeedbackSchema, rest)).toBe(true);
  });

  it('accepts null comments', () => {
    expect(isValid(createFeedbackSchema, { ...valid, comments: null })).toBe(true);
  });

  it('accepts empty string comments', () => {
    expect(isValid(createFeedbackSchema, { ...valid, comments: '' })).toBe(true);
  });

  it('rejects missing sessionId', () => {
    const { sessionId, ...rest } = valid;
    expect(isValid(createFeedbackSchema, rest)).toBe(false);
  });

  it('rejects missing studentId', () => {
    const { studentId, ...rest } = valid;
    expect(isValid(createFeedbackSchema, rest)).toBe(false);
  });

  it('rejects missing effortRating', () => {
    const { effortRating, ...rest } = valid;
    expect(isValid(createFeedbackSchema, rest)).toBe(false);
  });

  it('rejects missing participationRating', () => {
    const { participationRating, ...rest } = valid;
    expect(isValid(createFeedbackSchema, rest)).toBe(false);
  });

  it('rejects invalid UUID for sessionId', () => {
    expect(isValid(createFeedbackSchema, { ...valid, sessionId: 'not-uuid' })).toBe(false);
  });

  it('rejects effortRating below 1', () => {
    expect(isValid(createFeedbackSchema, { ...valid, effortRating: 0 })).toBe(false);
  });

  it('rejects effortRating above 5', () => {
    expect(isValid(createFeedbackSchema, { ...valid, effortRating: 6 })).toBe(false);
  });

  it('rejects participationRating below 1', () => {
    expect(isValid(createFeedbackSchema, { ...valid, participationRating: 0 })).toBe(false);
  });

  it('rejects participationRating above 5', () => {
    expect(isValid(createFeedbackSchema, { ...valid, participationRating: 6 })).toBe(false);
  });

  it('rejects non-integer rating', () => {
    expect(isValid(createFeedbackSchema, { ...valid, effortRating: 3.5 })).toBe(false);
  });

  it('rejects comments exceeding 2000 chars', () => {
    expect(isValid(createFeedbackSchema, { ...valid, comments: 'x'.repeat(2001) })).toBe(false);
  });

  it('accepts comments at exactly 2000 chars', () => {
    expect(isValid(createFeedbackSchema, { ...valid, comments: 'x'.repeat(2000) })).toBe(true);
  });
});

describe('bulkCreateFeedbackSchema', () => {
  const valid = {
    sessionId: UUID,
    records: [
      { studentId: UUID2, effortRating: 4, participationRating: 3, comments: 'Good' },
      { studentId: UUID, effortRating: 2, participationRating: 5 },
    ],
  };

  it('accepts valid bulk input', () => {
    expect(isValid(bulkCreateFeedbackSchema, valid)).toBe(true);
  });

  it('accepts single record', () => {
    expect(isValid(bulkCreateFeedbackSchema, {
      sessionId: UUID,
      records: [{ studentId: UUID2, effortRating: 3, participationRating: 3 }],
    })).toBe(true);
  });

  it('rejects empty records array', () => {
    expect(isValid(bulkCreateFeedbackSchema, { sessionId: UUID, records: [] })).toBe(false);
    expect(getErrors(bulkCreateFeedbackSchema, { sessionId: UUID, records: [] })).toContain('At least');
  });

  it('rejects missing records', () => {
    expect(isValid(bulkCreateFeedbackSchema, { sessionId: UUID })).toBe(false);
  });

  it('rejects missing sessionId', () => {
    expect(isValid(bulkCreateFeedbackSchema, { records: valid.records })).toBe(false);
  });

  it('rejects record with invalid studentId', () => {
    expect(isValid(bulkCreateFeedbackSchema, {
      sessionId: UUID,
      records: [{ studentId: 'bad', effortRating: 3, participationRating: 3 }],
    })).toBe(false);
  });

  it('rejects record with rating out of range', () => {
    expect(isValid(bulkCreateFeedbackSchema, {
      sessionId: UUID,
      records: [{ studentId: UUID2, effortRating: 7, participationRating: 3 }],
    })).toBe(false);
  });
});

describe('updateFeedbackSchema', () => {
  it('accepts effortRating only', () => {
    expect(isValid(updateFeedbackSchema, { effortRating: 5 })).toBe(true);
  });

  it('accepts participationRating only', () => {
    expect(isValid(updateFeedbackSchema, { participationRating: 2 })).toBe(true);
  });

  it('accepts comments only', () => {
    expect(isValid(updateFeedbackSchema, { comments: 'Updated' })).toBe(true);
  });

  it('accepts all fields', () => {
    expect(isValid(updateFeedbackSchema, { effortRating: 4, participationRating: 3, comments: 'Fine' })).toBe(true);
  });

  it('rejects empty object', () => {
    expect(isValid(updateFeedbackSchema, {})).toBe(false);
    expect(getErrors(updateFeedbackSchema, {})).toContain('At least one');
  });

  it('rejects effortRating of 0', () => {
    expect(isValid(updateFeedbackSchema, { effortRating: 0 })).toBe(false);
  });

  it('rejects effortRating of 6', () => {
    expect(isValid(updateFeedbackSchema, { effortRating: 6 })).toBe(false);
  });

  it('accepts null comments to clear', () => {
    expect(isValid(updateFeedbackSchema, { comments: null })).toBe(true);
  });
});
