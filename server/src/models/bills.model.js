const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bills = sequelize.define('Bill', {
    billId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    staffId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Staffs',
            key: 'staffId'
        }
    },
    reservationId : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Reservations',
            key: 'reservationId'
        }
    },
    tableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'RestaurantTables',
            key: 'tableId'
        }
    },
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'CardPayments',
            key: 'cardId'
        }
    },
    totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    billTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'card'),
        allowNull: false
    },
});

module.exports = Bills;