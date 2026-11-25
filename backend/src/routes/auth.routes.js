import express from 'express'
import * as authValidator from '../validators/auth.validators.js'
import { validate } from '../middleware/validate.js'
import * as authController from '../controllers/auth.controllers.js'

const router = express.Router();

router.post('/register', validate(authValidator.registerSchema), authController.register);
router.post('/verify-email', validate(authValidator.verifyEmailSchema), authController.verifyEmail);
router.post('/login', validate(authValidator.loginSchema), authController.login);
router.post('/refresh', validate(authValidator.refreshSchema), authController.refresh);
router.post('/logout', validate(authValidator.logoutSchema), authController.logout);
router.post('/forgot-password', validate(authValidator.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(authValidator.resetPasswordSchema), authController.resetPassword);

export default router;
