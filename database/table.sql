USE restaurantManagement;

CREATE TABLE
    IF NOT EXISTS Category (
        categoryId INT PRIMARY KEY AUTO_INCREMENT,
        categoryName VARCHAR(100) NOT NULL UNIQUE
    );

CREATE TABLE
    IF NOT EXISTS Menu (
        itemId VARCHAR(10) PRIMARY KEY NOT NULL,
        itemName VARCHAR(50) NOT NULL,
        categoryId INT,
        price DECIMAL(10, 2) CHECK (price >= 0.00),
        description VARCHAR(255),
        FOREIGN KEY (categoryId) REFERENCES Category (categoryId)
    );

CREATE TABLE
    IF NOT EXISTS Account (
        accountId INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        phoneNumber VARCHAR(15) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS Staffs (
        staffId INT PRIMARY KEY AUTO_INCREMENT,
        accountId INT NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        role ENUM ('manager', 'waiter', 'chef') NOT NULL,
        FOREIGN KEY (accountId) REFERENCES Account (accountId)
    );

CREATE TABLE
    IF NOT EXISTS RestaurantTables (
        tableId INT PRIMARY KEY AUTO_INCREMENT,
        tableName VARCHAR(50) NOT NULL UNIQUE,
        capacity INT NOT NULL,
        status ENUM ('available', 'occupied', 'reserved') DEFAULT 'available'
    );

CREATE TABLE
    IF NOT EXISTS TableBookings (
        availabilityId INT PRIMARY KEY AUTO_INCREMENT,
        tableId INT,
        bookingDate DATE NOT NULL,
        bookingTime TIME NOT NULL,
        isReserved BOOLEAN DEFAULT FALSE,
        status ENUM ('available', 'occupied', 'reserved') DEFAULT 'available',
        FOREIGN KEY (tableId) REFERENCES RestaurantTables (tableId)
    );

CREATE TABLE
    IF NOT EXISTS Reservations (
        reservationId INT PRIMARY KEY AUTO_INCREMENT,
        customerName VARCHAR(255) NOT NULL,
        tableId INT,
        reservationDate DATE NOT NULL,
        reservationTime TIME NOT NULL,
        headCount INT NOT NULL,
        specialRequest VARCHAR(255),
        FOREIGN KEY (tableId) REFERENCES RestaurantTables (tableId)
    );

CREATE TABLE
    IF NOT EXISTS CardPayments (
        cardId INT PRIMARY KEY AUTO_INCREMENT,
        cardNumber VARCHAR(16) NOT NULL,
        cardHolderName VARCHAR(255) NOT NULL,
        expiryDate DATE NOT NULL,
        cvv INT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS Bills (
        billId INT PRIMARY KEY AUTO_INCREMENT,
        staffId INT,
        reservationId INT,
        tableId INT,
        cardId INT,
        totalAmount DECIMAL(10, 2) NOT NULL,
        billTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paymentMethod ENUM ('cash', 'card') NOT NULL,
        FOREIGN KEY (staffId) REFERENCES Staffs (staffId),
        FOREIGN KEY (reservationId) REFERENCES Reservations (reservationId),
        FOREIGN KEY (tableId) REFERENCES RestaurantTables (tableId),
        FOREIGN KEY (cardId) REFERENCES CardPayments (cardId)
    );

CREATE TABLE
    IF NOT EXISTS BillItems (
        billItemId INT PRIMARY KEY AUTO_INCREMENT,
        billId INT,
        itemId VARCHAR(10),
        quantity INT NOT NULL,
        FOREIGN KEY (billId) REFERENCES Bills (billId),
        FOREIGN KEY (itemId) REFERENCES Menu (itemId)
    );

CREATE TABLE
    IF NOT EXISTS KitchenOrders (
        orderId INT PRIMARY KEY AUTO_INCREMENT,
        billId INT,
        staffId INT,
        itemId VARCHAR(10),
        quantity INT NOT NULL,
        orderTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM ('pending', 'cancelled', 'completed') DEFAULT 'pending',
        cancelReason VARCHAR(255) DEFAULT NULL,
        FOREIGN KEY (billId) REFERENCES Bills (billId),
        FOREIGN KEY (staffId) REFERENCES Staffs (staffId),
        FOREIGN KEY (itemId) REFERENCES Menu (itemId)
    );