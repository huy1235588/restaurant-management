USE restaurantManagement;

CREATE TABLE IF NOT EXISTS MenuFood (
    itemId VARCHAR(20) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    itemName VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(3, 2) CHECK(price >= 0.00)
);

CREATE TABLE IF NOT EXISTS TableStatus (
    tableId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    capacity int,
    status VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS Cart (
    tableId int(11) NOT NULL,
    itemId VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    orderAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tableId) REFERENCES TableStatus(tableId),
    FOREIGN KEY (itemId) REFERENCES MenuFood(itemId),
    PRIMARY KEY (tableId, itemId)
);