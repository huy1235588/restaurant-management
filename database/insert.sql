-- Insert sample data for Category
INSERT INTO
    Category (categoryName)
VALUES
    ('Appetizers'),
    ('Main Course'),
    ('Desserts'),
    ('Beverages'),
    ('Salads'),
    ('Soups'),
    ('Pasta'),
    ('Grill'),
    ('Pizza'),
    ('Seafood');

-- Insert sample data for Tables (50 entries)
INSERT INTO
    Tables (tableName, status, capacity)
VALUES
    ('T1', 'reserved', 4),
    ('T2', 'occupied', 2),
    ('T3', 'reserved', 6),
    ('T4', 'occupied', 4),
    ('T5', 'reserved', 8),
    ('T6', 'reserved', 4),
    ('T7', 'reserved', 6),
    ('T8', 'occupied', 2),
    ('T9', 'occupied', 4),
    ('T10', 'reserved', 10),
    ('T11', 'available', 4),
    ('T12', 'available', 6),
    ('T13', 'available', 2),
    ('T14', 'available', 4),
    ('T15', 'available', 6),
    ('T16', 'available', 8),
    ('T17', 'available', 4),
    ('T18', 'available', 4),
    ('T19', 'available', 2),
    ('T20', 'available', 4),
    ('T21', 'available', 10),
    ('T22', 'available', 6),
    ('T23', 'available', 4),
    ('T24', 'available', 4),
    ('T25', 'available', 2),
    ('T26', 'available', 8),
    ('T27', 'available', 4),
    ('T28', 'available', 6),
    ('T29', 'available', 4),
    ('T30', 'available', 2),
    ('T31', 'available', 4),
    ('T32', 'available', 10),
    ('T33', 'available', 8),
    ('T34', 'available', 6),
    ('T35', 'available', 4),
    ('T36', 'available', 2),
    ('T37', 'available', 6),
    ('T38', 'available', 4),
    ('T39', 'available', 10),
    ('T40', 'available', 4),
    ('T41', 'available', 8),
    ('T42', 'available', 6),
    ('T43', 'available', 2),
    ('T44', 'available', 4),
    ('T45', 'available', 6),
    ('T46', 'available', 8),
    ('T47', 'available', 4),
    ('T48', 'available', 6),
    ('T49', 'available', 2),
    ('T50', 'available', 10);

-- Insert sample data for MenuFood (50 entries)
INSERT INTO
    MenuFood (itemId, itemName, categoryId, price)
VALUES
    ('F1', 'Spring Rolls', 1, 5.99),
    ('F2', 'Garlic Bread', 1, 3.99),
    ('F3', 'Caesar Salad', 5, 7.99),
    ('F4', 'Tomato Soup', 6, 4.99),
    ('F5', 'Grilled Chicken', 8, 12.99),
    ('F6', 'Spaghetti Carbonara', 7, 10.99),
    ('F7', 'Margherita Pizza', 9, 9.99),
    ('F8', 'Tiramisu', 3, 6.99),
    ('F9', 'Iced Tea', 4, 2.99),
    ('F10', 'Grilled Salmon', 10, 15.99),
    ('F11', 'Cheesecake', 3, 6.49),
    ('F12', 'Chicken Soup', 6, 5.49),
    ('F13', 'Pasta Alfredo', 7, 11.99),
    ('F14', 'Veggie Pizza', 9, 8.99),
    ('F15', 'Grilled Steak', 8, 18.99),
    ('F16', 'Fruit Salad', 5, 6.49),
    ('F17', 'Hot Chocolate', 4, 3.49),
    ('F18', 'Seafood Pasta', 10, 14.99),
    ('F19', 'Garlic Shrimp', 1, 9.99),
    ('F20', 'BBQ Ribs', 8, 19.99),
    ('F21', 'Caprese Salad', 5, 8.49),
    ('F22', 'French Fries', 1, 3.49),
    ('F23', 'Pepperoni Pizza', 9, 10.99),
    ('F24', 'Vanilla Ice Cream', 3, 4.99),
    ('F25', 'Espresso', 4, 2.49),
    ('F26', 'Clam Chowder', 6, 6.99),
    ('F27', 'Lobster Tail', 10, 25.99),
    ('F28', 'Chicken Alfredo', 7, 13.99),
    ('F29', 'Greek Salad', 5, 7.49),
    ('F30', 'Veggie Soup', 6, 5.99),
    ('F31', 'Filet Mignon', 8, 29.99),
    ('F32', 'BBQ Chicken Pizza', 9, 12.99),
    ('F33', 'Mocha', 4, 3.99),
    ('F34', 'Ice Lemon Tea', 4, 3.29),
    ('F35', 'Prawn Tempura', 1, 10.49),
    ('F36', 'Chocolate Cake', 3, 7.49),
    ('F37', 'Cappuccino', 4, 3.49),
    ('F38', 'Grilled Veggies', 8, 7.99),
    ('F39', 'Fish and Chips', 10, 13.49),
    ('F40', 'Pesto Pasta', 7, 12.49),
    ('F41', 'Brownie', 3, 5.49),
    ('F42', 'Chicken Caesar Wrap', 5, 9.49),
    ('F43', 'Minestrone Soup', 6, 6.49),
    ('F44', 'BBQ Pork Ribs', 8, 21.99),
    ('F45', 'Seafood Pizza', 9, 15.99),
    ('F46', 'Fruit Punch', 4, 4.49),
    ('F47', 'Sushi Platter', 10, 24.99),
    ('F48', 'Margarita', 4, 5.99),
    ('F49', 'Chili Cheese Fries', 1, 6.99),
    ('F50', 'Beef Lasagna', 7, 14.49);

-- TABLE BOOKING
INSERT INTO
    TableBooking (
        tableId,
        customerName,
        phoneNumber,
        reservedTime,
        numberOfGuests
    )
VALUES
    (
        1,
        'John Doe',
        '0123456789',
        '2024-12-23 12:00:00',
        4
    ),
    (
        2,
        'Jane Smith',
        '0987654321',
        NULL,
        2
    ),
    (
        3,
        'Emily Johnson',
        '0912345678',
        '2024-12-23 14:00:00',
        3
    ),
    (
        4,
        'Michael Brown',
        '0934123456',
        NULL,
        5
    ),
    (
        5,
        'Sarah Lee',
        '0976123456',
        '2024-12-23 16:00:00',
        6
    ),
    (
        6,
        'David Wilson',
        '0963456789',
        '2024-12-23 17:00:00',
        2
    ),
    (
        7,
        'Sophia Clark',
        '0923456789',
        '2024-12-23 18:00:00',
        4
    ),
    (
        8,
        'James Miller',
        '0907654321',
        NULL,
        3
    ),
    (
        9,
        'Olivia Harris',
        '0912349876',
        NULL,
        2
    ),
    (
        10,
        'Liam Martinez',
        '0943456789',
        '2024-12-23 21:00:00',
        5
    );

-- Bill
INSERT INTO
    Bills (
        bookingId,
        totalAmount,
        paymentStatus,
        paymentMethod
    )
VALUES
    (1, 150.00, 'paid', 'cash'),
    (2, 80.50, 'pending', 'card'),
    (3, 120.00, 'failed', 'cash'),
    (4, 200.00, 'paid', 'card'),
    (5, 250.75, 'pending', 'cash'),
    (6, 90.00, 'paid', 'card'),
    (7, 160.30, 'failed', 'cash'),
    (8, 180.00, 'paid', 'cash'),
    (9, 140.00, 'pending', 'card'),
    (10, 220.00, 'paid', 'card');