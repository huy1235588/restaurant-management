const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const KitchenOrders = sequelize.define('KitchenOrders', {
    orderId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    staffId: {
        type: DataTypes.DATE,
        allowNull: false,
        references: {
            model: 'Staffs',
            key: 'staffId'
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
    orderTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'cancelled', 'completed'),
        allowNull: false
    },
    cancelReason: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = KitchenOrders;