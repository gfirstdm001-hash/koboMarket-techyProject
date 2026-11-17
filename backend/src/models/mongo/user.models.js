const mongoose = require('mongoose');

const refreshSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    tokenHash: {
        type: String,
        default: null
    },
    usedTokenHashes: {
        type: [String],
        default: []
    },
    expiresAt: {
        type: Date,
        required: true
    },
    revokedAt: {
        type: Date,
        default: null
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: { 
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8
    },
    roles: {
        type: [String],
        enum: ['buyer', 'vendor', 'admin'],
        default: ['buyer']
    },
    
    otp: {
        type: String,
        select: false,
    
    },
    otpExpiresAt: {
        type: Date,
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    walletProvisioningStatus: {
        type: String,
        enum: ['pending', 'ready'],
        default: 'pending'
    },
    refreshSessions: {
        type: [refreshSessionSchema],
        default: [],
        select: false
    },
    passwordResetTokenHash: {
        type: String,
        select: false
    },
    passwordResetExpiresAt: {
        type: Date,
        select: false
    }
}, {
    timestamps: true,
    versionKey: false
});

const User = mongoose.model('User', userSchema);

module.exports = User;