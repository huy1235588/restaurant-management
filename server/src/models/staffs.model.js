const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Staffs = sequelize.define('Staffs', {
    staffId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Accounts',
            key: 'accountId'
        }
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('manager', 'waiter', 'chef'),
        allowNull: false
    },
});

module.exports = Staffs;