const {DataTypes} = require('sequelize');
const {sequelize} = require('../../config/postgres');

const walletModel = sequelize.define('Wallet', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    availableBalanceKobo: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },

    reservedBalanceKobo: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },
        
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'NGN',
        allowNull: false
    } 
})

module.exports = walletModel;
