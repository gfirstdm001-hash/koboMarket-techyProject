import app from './src/app.js'
import 'dotenv/config'
import connectDb from './src/config/mongo.js'
import { connectPostgres } from './src/config/postgres.js'

const startServer = async () => {
    await connectDb();
    try {
        await connectPostgres();
    } catch (error) {
        console.error('PostgreSQL unavailable; continuing with MongoDB. Wallet features will be unavailable:', error.message);
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
});