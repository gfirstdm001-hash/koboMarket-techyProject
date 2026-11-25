import Joi from 'joi';

export const registerSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().min(2).max(100).trim().required(),
    lastName: Joi.string().min(2).max(100).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
});

export const verifyEmailSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().trim().required(),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  }),
});

export const refreshSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().trim().required(),
  }),
});

export const logoutSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().trim().required(),
  }),
});

export const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
  }),
});

export const resetPasswordSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().trim().required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),
});
