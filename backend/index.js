import app from './src/app.js'
import 'dotenv/config'

const startServer = async () => {
    await connectDb();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
});