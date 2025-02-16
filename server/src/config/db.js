// Cấu hình mysql
const mysql = require('mysql');
require('dotenv').config();

const connectDB = async () => {
    // Tạo kết nối tới database
    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    // Kết nối tới database
    db.connect((err) => {
        // Nếu có lỗi, in ra lỗi
        if (err) {
            console.log(`Error connecting to DB: ${err}`);
            return;
        }
        console.log('Connection established');
    });
}

module.exports = connectDB;