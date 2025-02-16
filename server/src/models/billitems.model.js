const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BillItems = sequelize.define('BillItems', {
    billItemId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    billId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Bills',
            key: 'billId'
        }
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'menu',
            key: 'itemId'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

module.exports = BillItems;