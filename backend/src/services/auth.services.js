import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import {env} from '../config/env.js'
import {logger} from '../config/logger.js'
import {User} from '../models/mongo/user.models.js'
import {AppError} from '../utils/appError.js'
import Account from '../models/postgres/account.models.js'


const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

async function issueTokens(user) {
  const accessToken = jwt.sign(
    { sub: user._id.toString(), roles: user.roles },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  if (user.refreshTokens.length >= 5) {
    user.refreshTokens.shift();
  }

  user.refreshTokens.push({
    tokenHash: hashToken(rawRefreshToken),
    isRevoked: false,
    expiresAt,
  });

  await user.save();

  return { accessToken, refreshToken: rawRefreshToken };
}

export async function register({ firstName, lastName, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, 'EMAIL_EXISTS', 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const rawVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash,
    emailVerifyTokenHash: hashToken(rawVerifyToken),
    emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  try {
    await Account.create({
      owner_type: 'USER',
      owner_id: user._id.toString(),
      currency: 'NGN',
      balance_kobo: 0,
    });
  } catch (pgErr) {
    await User.deleteOne({ _id: user._id });
    throw new AppError(500, 'WALLET_CREATION_FAILED', 'Registration failed while creating wallet');
  }

  logger.info({ email, verifyToken: rawVerifyToken }, 'Verification token generated');

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    verifyToken: env.nodeEnv !== 'production' ? rawVerifyToken : undefined,
  };
}

export async function verifyEmail(token) {
  const user = await User.findOne({
    emailVerifyTokenHash: hashToken(token),
    emailVerifyExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(400, 'INVALID_TOKEN', 'Verification token is invalid or expired');
  }

  user.isEmailVerified = true;
  user.emailVerifyTokenHash = null;
  user.emailVerifyExpires = null;
  await user.save();
}


export async function login({ email, password }) {
  const user = await User.findOne({ email });
  const comparePassword = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !comparePassword) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (user.isFrozen) {
    throw new AppError(403, 'ACCOUNT_FROZEN', 'Your account has been frozen by an administrator');
  }

  if (!user.isEmailVerified) {
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in');
  }

  const tokens = await issueTokens(user);
  return {
    user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, roles: user.roles },
    ...tokens,
  };
}

export async function refreshAccess(rawRefreshToken) {
  const incomingHash = hashToken(rawRefreshToken);
  const user = await User.findOne({ 'refreshTokens.tokenHash': incomingHash });

  if (!user) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token not recognized');
  }

  if (user.isFrozen) {
    throw new AppError(403, 'ACCOUNT_FROZEN', 'Your account has been frozen by an administrator');
  }

  const session = user.refreshTokens.find((t) => t.tokenHash === incomingHash);

  if (session.isRevoked) {
    user.refreshTokens = [];
    await user.save();
    throw new AppError(401, 'TOKEN_REUSE_DETECTED', 'Security alert: all sessions have been logged out');
  }

  if (session.expiresAt < new Date()) {
    throw new AppError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token has expired');
  }

  session.isRevoked = true;
  return issueTokens(user);
}

export async function logout(rawRefreshToken) {
  const incomingHash = hashToken(rawRefreshToken);
  const user = await User.findOne({ 'refreshTokens.tokenHash': incomingHash });
  if (!user) return;

  const session = user.refreshTokens.find((t) => t.tokenHash === incomingHash);
  if (session) {
    session.isRevoked = true;
    await user.save();
  }
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return;

  const rawResetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordTokenHash = hashToken(rawResetToken);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  logger.info({ email, resetToken: rawResetToken }, 'Password reset token generated');
  return env.nodeEnv !== 'production' ? rawResetToken : undefined;
}

export async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    resetPasswordTokenHash: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(400, 'INVALID_TOKEN', 'Password reset token is invalid or expired');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpires = null;
  user.refreshTokens = [];
  await user.save();
}
