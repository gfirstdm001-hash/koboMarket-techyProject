import * as authService from '../services/auth.services.js'

export async function register (req, res, next) {
    try {
        const data = await authService.register(req.body);
        res.status(201).json({success:true, data});
    }catch(err){
        next(err);
    }
}

export async function verifyEmail (req, res, next) {
    try{
        await authService.verifyEmail(req.body.token);
        res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const tokens = await authService.refreshAccess(req.body.refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const resetToken = await authService.forgotPassword(req.body.email);
    res.json({
      success: true,
      message: 'If that email exists, a reset token has been generated',
      ...(resetToken && { resetToken }),
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}
