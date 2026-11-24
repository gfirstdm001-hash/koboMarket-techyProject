'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. accounts (User wallets + System escrow/revenue/clearing accounts)
    await queryInterface.createTable('accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      owner_type: {
        type: Sequelize.ENUM('USER', 'SYSTEM'),
        allowNull: false,
      },
      owner_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'NGN',
      },
      balance_kobo: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('accounts', ['owner_type', 'owner_id', 'currency'], {
      unique: true,
      name: 'accounts_owner_currency_unique',
    });

    // 2. transactions (Master financial event log)
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: Sequelize.ENUM('DEPOSIT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'REFUND', 'PAYOUT'),
        allowNull: false,
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    
    await queryInterface.createTable('ledger_entries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'transactions', key: 'id' },
        onDelete: 'RESTRICT',
      },
      account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'RESTRICT',
      },
      direction: {
        type: Sequelize.ENUM('DEBIT', 'CREDIT'),
        allowNull: false,
      },
      amount_kobo: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    
    await queryInterface.createTable('idempotency_keys', {
      key: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      endpoint: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status_code: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      response_body: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('idempotency_keys');
    await queryInterface.dropTable('ledger_entries');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('accounts');
  },
};
