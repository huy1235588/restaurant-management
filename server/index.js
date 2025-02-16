const express = require('express');
const connectDB = require('./src/config/db');
const dotenv = require('dotenv');
const { join } = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Tải file .env vào project
dotenv.config();

// Sử dụng port mặc định hoặc 3000
const PORT = process.env.PORT || 3001;

// Khởi tạo express
const app = express();

// Kết nối tới database
// connectDB();

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