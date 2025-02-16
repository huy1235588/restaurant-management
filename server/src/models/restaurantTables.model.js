const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RestaurantTables = sequelize.define('RestaurantTables', {
    tableId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tableName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('available', 'occupied', 'reserved'),
        defaultValue: 'available'
    }
});

module.exports = RestaurantTables;