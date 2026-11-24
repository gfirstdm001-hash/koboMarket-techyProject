import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  redact: [
    'req.headers.authorization',
    'req.body.password',
    'req.body.newPassword',
    'req.body.token',
    'req.body.refreshToken',
  ],
  transport:
    env.nodeEnv !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
