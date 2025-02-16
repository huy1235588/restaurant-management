const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CardPayments = sequelize.define('CardPayments', {
    cardId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    cardNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cardHolderName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    cvv: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

module.exports = CardPayments;