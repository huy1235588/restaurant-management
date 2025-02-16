const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reservations = sequelize.define('Reservations', {
    reservationId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'RestaurantTables',
            key: 'tableId'
        }
    },
    reservationDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reservationTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    headCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    specialRequest: {
        type: DataTypes.STRING,
        allowNull: true
    },
});

module.exports = Reservations;