const crypto = require('crypto');
const LoginAttempt = require('../models/mongo/login-attempt.models');

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

const getKey = (email, ip) => crypto
    .createHash('sha256')
    .update(`${String(email).trim().toLowerCase()}\0${ip}`)
    .digest('hex');

const isLoginBlocked = async (email, ip) => {
    const attempt = await LoginAttempt.findOne({
        key: getKey(email, ip),
        expiresAt: { $gt: new Date() }
    }).select('count');

    return Boolean(attempt && attempt.count >= MAX_FAILED_ATTEMPTS);
};

const recordFailedLogin = async (email, ip) => {
    const key = getKey(email, ip);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + WINDOW_MS);

    const activeAttempt = await LoginAttempt.findOneAndUpdate(
        { key, expiresAt: { $gt: now } },
        { $inc: { count: 1 } },
        { new: true }
    );
    if (activeAttempt) {
        return activeAttempt.count;
    }

    const expiredAttempt = await LoginAttempt.findOneAndUpdate(
        { key, expiresAt: { $lte: now } },
        { $set: { count: 1, expiresAt } },
        { new: true }
    );
    if (expiredAttempt) {
        return expiredAttempt.count;
    }

    try {
        const newAttempt = await LoginAttempt.create({ key, count: 1, expiresAt });
        return newAttempt.count;
    } catch (error) {
        if (error.code === 11000) {
            return recordFailedLogin(email, ip);
        }
        throw error;
    }
};

const clearFailedLogins = async (email, ip) => {
    await LoginAttempt.deleteOne({ key: getKey(email, ip) });
};

module.exports = { isLoginBlocked, recordFailedLogin, clearFailedLogins };
