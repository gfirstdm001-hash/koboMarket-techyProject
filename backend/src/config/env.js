import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,

  
  mongoUri: process.env.MONGO_URI,
  postgresUrl: process.env.POSTGRES_URL,

  nodeEnv:process.env.NODE_ENV|| development,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,

 
  commissionBps: Number(process.env.PLATFORM_COMMISSION_BPS) || 500,
  escrowTimeoutHours: Number(process.env.ESCROW_TIMEOUT_HOURS) || 72,
  minPayoutKobo: BigInt(process.env.MIN_PAYOUT_KOBO || 100000),
};
