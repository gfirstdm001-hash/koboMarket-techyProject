const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(process.env.PSDB_URI, {
    host: process.env.PSDB_HOST,
    dialect: 'postgres',
    logging: console.log
});
  
const connectPsdb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to PostgreSQL database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the PostgreSQL database:', error);
        throw error;
    }
};

module.exports = {sequelize, connectPsdb};