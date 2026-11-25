import { AppError } from '../utils/appError.js';

export function validate(schema) {
  return (req, res, next) => {
    const payload = {};
    if (schema.describe().keys.body) payload.body = req.body;
    if (schema.describe().keys.query) payload.query = req.query;
    if (schema.describe().keys.params) payload.params = req.params;

    const { error, value } = schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', details));
    }

    if (value.body) req.body = value.body;
    if (value.query) req.query = value.query;
    if (value.params) req.params = value.params;

    next();
  };
}
