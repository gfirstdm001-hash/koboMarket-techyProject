import Sequelize from 'sequelize'
import {env} from './env.js'
import {logger} from './logger.js'

export const sequelize = new Sequelize (env.postgresUrl,{dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

);
export async function connectPostgres() {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
  } catch (err) {
    logger.error({ err }, 'PostgreSQL connection failed');
    throw err;
  }
}
