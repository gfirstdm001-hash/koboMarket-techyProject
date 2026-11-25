import jwt from 'jsonwebtoken';
import { User } from '../models/mongo/user.models.js';
import { AppError } from '../utils/appError.js'
import { env } from '../config/env.js'

export async function authenticate(req, res, next) {
    try{
    const authUser = req.headers.authorization;
    if(!authUser || !authUser.startsWith('Bearer')){
        return next(new AppError(404, 'UNAUTHORIZED', 'Missing or invalid authorization header'))
    }
    const token = authUser.slice(7).trim();
    try{
    const decoded = jwt.verify(token, env.jwtAccessSecret);
   } catch{
    return next(new AppError(401, 'TOKEN_INVALID', 'Access token is invalid or expired'))
}
   const user = await User.findById(decoded.id).select('-passwordHash, -emailVerifyTokenHash, -refreshTokens, -resetPasswordTokenHash');
  if (!user) {
      return next(new AppError(401, 'USER_NOT_FOUND', 'User belonging to this token no longer exists'));
    }

    if (user.isFrozen) {
      return next(new AppError(403, 'ACCOUNT_FROZEN', 'Your account has been frozen by an administrator'));
    }

    req.user = user;
    next();
    } catch(err){
        next(err)
    }

}
