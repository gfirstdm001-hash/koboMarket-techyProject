require('dotenv').config();

const express = require('express');
const app = express();
const connectDb = require('./src/config/mongo');
const { connectPsdb } = require('./src/config/postgres');
const Wallet = require('./src/models/postgres/wallet.models');
const { startWalletProvisioningRetries } = require('./src/services/wallet-provisioning.service');
const userRoutes = require('./src/routes/auth.routes');

app.use(express.json());
app.use('/api/users', userRoutes);

const startServer = async () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET must be configured before starting the server');
    }

    await connectDb();
    await connectPsdb();
    await Wallet.sync();

    startWalletProvisioningRetries();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
});