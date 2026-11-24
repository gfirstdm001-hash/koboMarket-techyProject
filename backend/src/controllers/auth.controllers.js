import User from '../models/mongo/user.models.js';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import loginAttemptsService from '../services/login-attempts.service.js';
import walletProvisioningService from '../services/wallet-provisioning.service.js';

const { isLoginBlocked, recordFailedLogin, clearFailedLogins } = loginAttemptsService;
const { provisionWalletForUser } = walletProvisioningService;


const hashToken = (token) => crypto.createHash('sha256').update(String(token), 'utf8').digest('hex');

const createRefreshSession = (sessionId = crypto.randomBytes(16).toString('hex')) => {
    const refreshSecret = crypto.randomBytes(32).toString('hex');
    const refreshToken = `${sessionId}.${refreshSecret}`;

    return {
        sessionId,
        refreshToken,
        tokenHash: hashToken(refreshSecret),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
};

const parseRefreshToken = (refreshToken) => {
    if (typeof refreshToken !== 'string') {
        return null;
    }

    const parts = refreshToken.split('.');
    if (
        parts.length !== 2 ||
        !/^[a-f0-9]{32}$/.test(parts[0]) ||
        !/^[a-f0-9]{64}$/.test(parts[1]) 
    ) {
        return null;
    }

    return {
        sessionId: parts[0],
        tokenHash: hashToken(parts[1])
    };
};


const registerUser = async() => {
    // DEFINE  THE REQUIRED DATAS REQUIRED FR REGISTRATION
    const {firstName, lastName, email, password} = req.body;
    // WRITE AN IF STATEMENT EXPRESSING THE REQUIRED FIELDS ARE ESSENTIAL FOR INPUTATION
    if(!firstName || !lastName || !email ||!password) {
        return res.status(400).json({message: 'All fields are required'});
    }
     if (typeof password !== string || password < 8){
        return res.status(400).json({message : 'Password must contain atleast 8 characters'})
     }

    try{ 
        // FIND OUT IF THIS USER ALREADY EXISTS OR NOT
        const existingUser = await User.findOne({email});
        if (existingUser){  
            return res.status(409).json({message : 'User already exists!'})
        }
       // Upnext hashing user password AND CREATING OTP
        const hashPassword = bcrypt.hash(password, 12);
        const otp = crypto.randomInt(100000, 999999);
        const otpExpiresAt  = new Date (Date.now() + 10*60*1000);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            otp,
            otpExpiresAt,
            walletProvisioningStatus : 'pending'
        });
       try {
        // WAIT TO DRAG THE PROVISION WALLET FUNCTION IN TO THE LOGIC
        await provisionWalletForUser(newUser.id);
    }catch(error){
        console.error(`Wallet provisioning failed for new user ${newUser._id}:`, error);
            return res.status(503).json({
                message: 'Account was created, but wallet setup is pending. Please try again later.'
            });
        }

        return res.status(201).json({
            message: 'User registered. Check the server console for the email verification OTP.',
            user: { firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'User already exists' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        console.error('User registration failed:', error);
        return res.status(500).json({ message: 'Registration failed' });
    }
};



const verifyEmail = async (req, res) => {
    const {email, otp} = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and verification OTP are required' });
    }

    try {
        const findUser = await User.findOne({ email }).select(
            '+otp +otpExpiresAt'
        );
        if (!findUser) {
            return res.status(400).json({ message: 'Invalid or expired verification otp' });
        }
        console.log(!findUser);

        if (findUser.isEmailVerified) {
            return res.status(200).json({ message: 'Email is already verified' });
        }

        const now = new Date();
        if (
            !findUser.otp ||
            findUser.otp !== String(verificationOtp) ||
            !findUser.otpExpiresAt ||
            findUser.otpExpiresAt <= now
        ) {
            return res.status(400).json({ message: 'Invalid or expired verification OTP' });
        }

        findUser.isEmailVerified = true;
        findUser.otp = null;
        findUser.otpExpiresAt = null;
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification failed:', error);
        return res.status(500).json({ message: 'Email verification failed' });
    }
};
    
const loginUser = async (req, res) => {
  const {email, password} = req.body;
  const ip = req.ip || req.socket.remoteAddres;

  if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        await isLoginBlocked(email, ip);
    if(isLoginBlocked(email, ip)){
        return res.status(429).json({ message: 'Too many failed login attempts. Try again in 15 minutes.' });
    }
      const findUser = await User.findOne({ email }).select('+refreshSessions');
        const passwordIsValid = await bcrypt.compare(password, user.password);
             
        if (!findUser || !passwordIsValid) {
            await recordFailedLogin(email, ip);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        await clearFailedLogins(email, ip);

        if (!findUser.isEmailVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in' });
        }
        if (findUser.walletProvisioningStatus !== 'ready') {
            return res.status(503).json({ message: 'Your wallet is still being set up. Please try again later.' });
        }

        const createAccessToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
        { id: findUser._id.toString(), type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};
        const session = createRefreshSession();
        const now = new Date();
        user.refreshSessions = (user.refreshSessions || []).filter(
            (existingSession) => existingSession.expiresAt > now && !existingSession.revokedAt
        );
        user.refreshSessions.push({
            sessionId: session.sessionId,
            tokenHash: session.tokenHash,
            usedTokenHashes: [],
            expiresAt: session.expiresAt,
            revokedAt: null
        });
        await user.save();

        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken: session.refreshToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                roles: user.roles,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('Login failed:', error);
        return res.status(500).json({ message: 'Login failed' });
    }
};






const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;




const revokeAllRefreshSessions = async (userId) => User.updateOne(
    { _id: userId },
    {
        $set: {
            'refreshSessions.$[].tokenHash': null,
            'refreshSessions.$[].revokedAt': new Date()
        }
    }
);





const refreshAccessToken = async (req, res) => {
    const refreshToken = req.body;
    const parsedToken = parseRefreshToken(refreshToken);
    if (!parsedToken) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }

    try {
        const user = await User.findOne({
            'refreshSessions.sessionId': parsedToken.sessionId
        }).select('+refreshSessions');

        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        const session = user.refreshSessions.find(
            (candidate) => candidate.sessionId === parsedToken.sessionId
        );
        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        if (session.usedTokenHashes.includes(parsedToken.tokenHash)) {
            await revokeAllRefreshSessions(user._id);
            return res.status(401).json({
                message: 'Refresh token reuse detected. Please log in again on all devices.'
            });
        }
        if (
            session.revokedAt ||
            session.tokenHash !== parsedToken.tokenHash ||
            session.expiresAt <= new Date()
        ) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        const nextSession = createRefreshSession(parsedToken.sessionId);
        const accessToken = createAccessToken(user);
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: user._id,
                refreshSessions: {
                    $elemMatch: {
                        sessionId: parsedToken.sessionId,
                        tokenHash: parsedToken.tokenHash,
                        revokedAt: null,
                        expiresAt: { $gt: new Date() }
                    }
                }
            },
            {
                $set: {
                    'refreshSessions.$.tokenHash': nextSession.tokenHash,
                    'refreshSessions.$.expiresAt': nextSession.expiresAt
                },
                $push: { 'refreshSessions.$.usedTokenHashes': parsedToken.tokenHash }
            },
            { new: true }
        );

        if (!updatedUser) {
            const latestUser = await User.findById(user._id).select('+refreshSessions');
            const latestSession = latestUser && latestUser.refreshSessions.find(
                (candidate) => candidate.sessionId === parsedToken.sessionId
            );
            if (latestSession && latestSession.usedTokenHashes.includes(parsedToken.tokenHash)) {
                await revokeAllRefreshSessions(user._id);
                return res.status(401).json({
                    message: 'Refresh token reuse detected. Please log in again on all devices.'
                });
            }

            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        return res.status(200).json({
            accessToken,
            refreshToken: nextSession.refreshToken
        });
    } catch (error) {
        console.error('Token refresh failed:', error);
        return res.status(500).json({ message: 'Unable to refresh session' });
    }
};

const logoutUser = async (req, res) => {
    const body = req.body || {};
    const parsedToken = parseRefreshToken(body.refreshToken);
    if (!parsedToken) {
        return res.status(400).json({ message: 'A valid refresh token is required' });
    }

    try {
        const user = await User.findOne({
            'refreshSessions.sessionId': parsedToken.sessionId
        }).select('+refreshSessions');
        if (!user) {
            return res.status(200).json({ message: 'Logged out successfully' });
        }

        const session = user.refreshSessions.find(
            (candidate) => candidate.sessionId === parsedToken.sessionId
        );
        if (session && session.tokenHash === parsedToken.tokenHash && !session.revokedAt) {
            await User.updateOne(
                {
                    _id: user._id,
                    refreshSessions: {
                        $elemMatch: {
                            sessionId: parsedToken.sessionId,
                            tokenHash: parsedToken.tokenHash,
                            revokedAt: null
                        }
                    }
                },
                {
                    $set: {
                        'refreshSessions.$.tokenHash': null,
                        'refreshSessions.$.revokedAt': new Date()
                    },
                    $push: { 'refreshSessions.$.usedTokenHashes': parsedToken.tokenHash }
                }
            );
        } else if (session && session.usedTokenHashes.includes(parsedToken.tokenHash)) {
            await revokeAllRefreshSessions(user._id);
        }

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout failed:', error);
        return res.status(500).json({ message: 'Logout failed' });
    }
};

const forgotPassword = async (req, res) => {
    const body = req.body || {};
    const email = body.email ? normalizeEmail(body.email) : '';
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.passwordResetTokenHash = hashToken(resetToken);
            user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_LIFETIME_MS);
            await user.save();
            console.log(`Password reset token for ${email}: ${resetToken}`);
        }

        return res.status(200).json({
            message: 'If an account exists for that email, a password reset token has been generated.'
        });
    } catch (error) {
        console.error('Password reset request failed:', error);
        return res.status(500).json({ message: 'Unable to process password reset request' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Reset token and new password are required' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
        const user = await User.findOne({
            passwordResetTokenHash: hashToken(String(token)),
            passwordResetExpiresAt: { $gt: new Date() }
        }).select('+passwordResetTokenHash +passwordResetExpiresAt +refreshSessions');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        user.password = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS);
        user.passwordResetTokenHash = null;
        user.passwordResetExpiresAt = null;
        const revokedAt = new Date();
        for (const session of user.refreshSessions || []) {
            session.tokenHash = null;
            session.revokedAt = revokedAt;
        }
        await user.save();

        return res.status(200).json({
            message: 'Password reset successfully. Please log in again on your devices.'
        });
    } catch (error) {
        console.error('Password reset failed:', error);
        return res.status(500).json({ message: 'Password reset failed' });
    }
};

export {
    registerUser,
    verifyEmail,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword
};
