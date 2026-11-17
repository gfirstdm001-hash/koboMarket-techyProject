const User = require('../models/mongo/user.models');
const Wallet = require('../models/postgres/wallet.models');

const provisionWalletForUser = async (userId) => {
    const mongoUserId = userId.toString();

    await Wallet.findOrCreate({
        where: { userId: mongoUserId },
        defaults: { userId: mongoUserId }
    });

    const result = await User.updateOne(
        { _id: userId },
        { $set: { walletProvisioningStatus: 'ready' } }
    );

    if (result.matchedCount === 0) {
        throw new Error(`Cannot mark wallet ready: user ${mongoUserId} was not found`);
    }
};

const retryPendingWallets = async () => {
    const pendingUsers = await User.find({
        walletProvisioningStatus: { $ne: 'ready' }
    }).select('_id').lean();

    for (const pendingUser of pendingUsers) {
        try {
            await provisionWalletForUser(pendingUser._id);
        } catch (error) {
            console.error(`Wallet provisioning retry failed for user ${pendingUser._id}:`, error);
        }
    }
};

const startWalletProvisioningRetries = (intervalMs = 60 * 1000) => {
    const retry = () => {
        retryPendingWallets().catch((error) => {
            console.error('Unable to scan for pending wallet provisioning:', error);
        });
    };

    retry();
    const timer = setInterval(retry, intervalMs);
    timer.unref();
};

module.exports = {
    provisionWalletForUser,
    retryPendingWallets,
    startWalletProvisioningRetries
};
