import express from 'express'
import * as userControllers from '../controllers/user.controllers.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { updateMeSchema } from '../validators/user.validators.js'
import { validate } from '../middleware/validate.js'

const router = express.Router();

router.get('/me', authenticate, userControllers.getMe);
router.patch('/me', authenticate, validate(updateMeSchema), userControllers.updateMe);

export default router;
