import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/postgres.js';

export const Account = sequelize.define(
  'Account',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    owner_type: { type: DataTypes.ENUM('USER', 'SYSTEM'), allowNull: false },
    owner_id: { type: DataTypes.STRING, allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'NGN' },
    balance_kobo: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  },
  {
    tableName: 'accounts',
    underscored: true,
    timestamps: true,
  }
);
