const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TableBookings = sequelize.define('TableBookings', {
    availabilityId : {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'RestaurantTables',
            key: 'tableId'
        }
    },
    bookingDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    bookingTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isReserved: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'cancelled', 'completed'),
        allowNull: false
    },
});

module.exports = TableBookings;