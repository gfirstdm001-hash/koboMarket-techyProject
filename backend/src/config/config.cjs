const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  development: {
    use_env_variable: 'PSDB_URI',
    host: process.env.PSDB_HOST,
    dialect: 'postgres'
  },
  test: {
    use_env_variable: 'PSDB_URI',
    host: process.env.PSDB_HOST,
    dialect: 'postgres'
  },
  production: {
    use_env_variable: 'PSDB_URI',
    host: process.env.PSDB_HOST,
    dialect: 'postgres'
  }
};

module.exports = config;
