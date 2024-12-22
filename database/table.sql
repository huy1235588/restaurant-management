USE restaurantManagement;

CREATE TABLE
    IF NOT EXISTS Category (
        categoryId INT PRIMARY KEY AUTO_INCREMENT,
        categoryName VARCHAR(100) NOT NULL UNIQUE
    );

CREATE TABLE
    IF NOT EXISTS Tables (
        tableId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        tableName VARCHAR(50) NOT NULL,
        status ENUM ('available', 'occupied', 'reserved') DEFAULT 'available',
        capacity INT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS MenuFood (
        itemId VARCHAR(10) PRIMARY KEY NOT NULL,
        itemName VARCHAR(50) NOT NULL,
        categoryId INT,
        price DECIMAL(7, 2) CHECK (price >= 0.00),
        FOREIGN KEY (categoryId) REFERENCES Category (categoryId)
    );

CREATE TABLE
    IF NOT EXISTS Cart (
        tableId INT NOT NULL,
        itemId VARCHAR(20) NOT NULL,
        quantity INT NOT NULL,
        status ENUM ('pending', 'completed', 'error') NOT NULL,
        orderAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tableId) REFERENCES Tables (tableId),
        FOREIGN KEY (itemId) REFERENCES MenuFood (itemId),
        PRIMARY KEY (tableId, itemId)
    );

CREATE TABLE
    IF NOT EXISTS TableBooking (
        bookingId INT AUTO_INCREMENT PRIMARY KEY,
        tableId INT NOT NULL,
        customerName VARCHAR(150) NOT NULL,
        phoneNumber VARCHAR(15),
        reservedTime DATETIME DEFAULT NULL,
        numberOfGuests INT NOT NULL,
        createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tableId) REFERENCES Tables (tableId)
    );

CREATE TABLE
    IF NOT EXISTS Bills (
        billId INT AUTO_INCREMENT PRIMARY KEY,
        bookingId INT NOT NULL,
        totalAmount DECIMAL(10, 2) DEFAULT 0,
        paymentStatus ENUM ('paid', 'pending', 'failed') NOT NULL,
        paymentMethod ENUM ('cash', 'card') DEFAULT 'cash',
        createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bookingId) REFERENCES TableBooking (bookingId)
    );