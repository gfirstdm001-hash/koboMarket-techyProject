import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestLogger } from './middleware/requestId.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from'./routes/user.routes.js'



const app = express();


app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(requestLogger);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/api/v1', (req, res) => {
    res.send('KoboMrket API is running');
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'Internal server error',
        ...(err.details && { details: err.details }),
    });
});

export default app;