import Joi from 'joi';

export const updateMeSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().min(2).max(100).trim().required(),
  }),
});
