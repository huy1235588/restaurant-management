const express = require('express');
const dotenv = require('dotenv');
const { join } = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Khai báo
const sequelize = require('./src/config/db');
const account = require('./src/models/account.model');
const billItems = require('./src/models/billItems.model');
const bills = require('./src/models/bills.model');
const cardPayment = require('./src/models/cardPayments.model');
const category = require('./src/models/category.model');
const kitchenOrders = require('./src/models/kitchenOrders.model');
const menu = require('./src/models/menu.model');
const reservations = require('./src/models/reservations.model');
const restaurantTables = require('./src/models/restaurantTables.model');
const staffs = require('./src/models/staffs.model');
const tableBookings = require('./src/models/tableBookings.model');

// Tải file .env vào project
dotenv.config();

// Sử dụng port mặc định hoặc 3000
const PORT = process.env.PORT || 3001;

// Khởi tạo express
const app = express();

// Kết nối tới database
sequelize.authenticate();
sequelize.sync().then(() => {
    console.log('Database connected');
});

// Socket
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Tạo route mặc định
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});