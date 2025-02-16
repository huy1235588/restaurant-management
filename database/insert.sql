-- Categories
INSERT INTO
    Category (categoryName)
VALUES
    ('Appetizers'),
    ('Main Courses'),
    ('Desserts'),
    ('Beverages');

-- Menu Items
INSERT INTO
    Menu (itemId, itemName, categoryId, price, description)
VALUES
    (
        'M001',
        'Veggie Spring Rolls',
        1,
        4.99,
        'Crispy rolls stuffed with fresh vegetables'
    ),
    (
        'M002',
        'Teriyaki Chicken',
        2,
        13.50,
        'Grilled chicken glazed with teriyaki sauce'
    ),
    (
        'M003',
        'Red Velvet Cake',
        3,
        7.50,
        'Rich red velvet cake with cream cheese frosting'
    ),
    (
        'M004',
        'Pepsi',
        4,
        2.00,
        'Chilled Pepsi beverage'
    ),
    (
        'M005',
        'Greek Salad',
        1,
        6.99,
        'Fresh salad with feta cheese and olives'
    ),
    (
        'M006',
        'Ribeye Steak',
        2,
        18.99,
        'Juicy ribeye steak grilled to perfection'
    ),
    (
        'M007',
        'Lemon Tart',
        3,
        5.99,
        'Tangy lemon tart with a buttery crust'
    ),
    (
        'M008',
        'Sparkling Water',
        4,
        2.50,
        'Refreshing sparkling water'
    ),
    (
        'M009',
        'Cheesy Garlic Bread',
        1,
        4.99,
        'Toasted garlic bread with melted cheese'
    ),
    (
        'M010',
        'Fettuccine Alfredo',
        2,
        12.50,
        'Pasta with creamy Alfredo sauce'
    ),
    (
        'M011',
        'Mango Cheesecake',
        3,
        6.99,
        'Cheesecake topped with fresh mango puree'
    ),
    (
        'M012',
        'Iced Mocha',
        4,
        3.50,
        'Cold coffee with chocolate and cream'
    ),
    (
        'M013',
        'Caprese Salad',
        1,
        5.99,
        'Tomato and mozzarella salad with basil'
    ),
    (
        'M014',
        'Grilled Pork Chops',
        2,
        16.50,
        'Pork chops grilled with BBQ sauce'
    ),
    (
        'M015',
        'Strawberry Shortcake',
        3,
        7.00,
        'Shortcake with strawberries and whipped cream'
    ),
    (
        'M016',
        'Mint Lemonade',
        4,
        3.00,
        'Lemonade infused with fresh mint'
    ),
    (
        'M017',
        'Shrimp Cocktail',
        1,
        8.99,
        'Chilled shrimp with cocktail sauce'
    ),
    (
        'M018',
        'Baked Salmon',
        2,
        15.50,
        'Salmon baked with herbs and lemon'
    ),
    (
        'M019',
        'Coconut Panna Cotta',
        3,
        6.50,
        'Creamy panna cotta with coconut flavor'
    ),
    (
        'M020',
        'Herbal Tea',
        4,
        2.50,
        'Aromatic herbal tea'
    ),
    (
        'M021',
        'Stuffed Zucchini',
        1,
        6.99,
        'Zucchini stuffed with cheese and vegetables'
    ),
    (
        'M022',
        'BBQ Beef Ribs',
        2,
        17.99,
        'Slow-cooked beef ribs with BBQ sauce'
    ),
    (
        'M023',
        'Banana Split',
        3,
        6.00,
        'Banana with ice cream, chocolate, and nuts'
    ),
    (
        'M024',
        'Espresso Macchiato',
        4,
        2.50,
        'Espresso with a dash of foamed milk'
    ),
    (
        'M025',
        'Fried Calamari',
        1,
        7.99,
        'Crispy fried squid rings with dipping sauce'
    ),
    (
        'M026',
        'Chicken Parmesan',
        2,
        14.99,
        'Breaded chicken with marinara and cheese'
    ),
    (
        'M027',
        'Blueberry Muffin',
        3,
        3.99,
        'Soft muffin with fresh blueberries'
    ),
    (
        'M028',
        'Vanilla Milkshake',
        4,
        3.99,
        'Creamy milkshake with vanilla flavor'
    ),
    (
        'M029',
        'Chili Nachos',
        1,
        7.50,
        'Nachos topped with chili, cheese, and sour cream'
    ),
    (
        'M030',
        'Seafood Paella',
        2,
        16.99,
        'Traditional Spanish rice dish with seafood'
    ),
    (
        'M031',
        'Black Forest Cake',
        3,
        7.50,
        'Chocolate cake layered with cherries and cream'
    ),
    (
        'M032',
        'Berry Smoothie',
        4,
        4.50,
        'Smoothie made with mixed berries'
    ),
    (
        'M033',
        'Chicken Wings',
        1,
        8.50,
        'Spicy and crispy chicken wings'
    ),
    (
        'M034',
        'Vegetable Lasagna',
        2,
        13.00,
        'Lasagna layered with vegetables and cheese'
    ),
    (
        'M035',
        'Pumpkin Pie',
        3,
        5.99,
        'Seasonal pumpkin pie with whipped cream'
    ),
    (
        'M036',
        'Hot Cappuccino',
        4,
        3.00,
        'Hot coffee with steamed milk foam'
    ),
    (
        'M037',
        'Spinach Artichoke Dip',
        1,
        6.50,
        'Warm dip served with tortilla chips'
    ),
    (
        'M038',
        'Roasted Duck',
        2,
        18.50,
        'Roasted duck served with orange glaze'
    ),
    (
        'M039',
        'Vanilla Pudding',
        3,
        4.99,
        'Creamy vanilla pudding with caramel topping'
    ),
    (
        'M040',
        'Chai Latte',
        4,
        3.50,
        'Hot spiced tea with milk'
    ),
    (
        'M041',
        'Eggplant Parmesan',
        1,
        9.50,
        'Breaded eggplant with marinara and cheese'
    ),
    (
        'M042',
        'Lobster Tail',
        2,
        22.99,
        'Grilled lobster tail with butter sauce'
    ),
    (
        'M043',
        'Chocolate Truffle',
        3,
        6.50,
        'Rich chocolate truffle with ganache'
    ),
    (
        'M044',
        'Cold Brew Coffee',
        4,
        3.99,
        'Iced coffee steeped for a smooth flavor'
    ),
    (
        'M045',
        'Deviled Eggs',
        1,
        5.50,
        'Classic deviled eggs with paprika'
    ),
    (
        'M046',
        'Turkey Roast',
        2,
        19.99,
        'Oven-roasted turkey with cranberry sauce'
    ),
    (
        'M047',
        'Peach Cobbler',
        3,
        6.00,
        'Warm peach cobbler with vanilla ice cream'
    ),
    (
        'M048',
        'Energy Drink',
        4,
        2.99,
        'Refreshing energy drink'
    ),
    (
        'M049',
        'Falafel Platter',
        1,
        7.99,
        'Crispy falafels with hummus and pita bread'
    ),
    (
        'M050',
        'Shrimp Scampi',
        2,
        15.99,
        'Shrimp in garlic butter sauce with pasta'
    );

-- Accounts
INSERT INTO
    Account (username, email, phoneNumber, password)
VALUES
    ('ha', 'ha@example.com', '1234567890', 'ha'),
    ('he', 'he@example.com', '0987654321', 'he'),
    ('hi', 'hi@example.com', '0983444321', 'hi');

-- Staffs
INSERT INTO
    Staffs (accountId, fullName, address, role)
VALUES
    (1, 'haha', '123 Main Street', 'chef'),
    (2, 'hehe', '456 Elm Street', 'waiter'),
    (3, 'hihi', '789 Oak Street', 'manager');

-- Restaurant Tables
INSERT INTO
    RestaurantTables (tableName, capacity, status)
VALUES
    ('T1', 4, 'occupied'),
    ('T2', 6, 'reserved'),
    ('T3', 2, 'available'),
    ('T4', 4, 'available'),
    ('T5', 6, 'available'),
    ('T6', 2, 'available'),
    ('T7', 4, 'available'),
    ('T8', 6, 'available'),
    ('T9', 2, 'available'),
    ('T10', 4, 'available'),
    ('T11', 6, 'available'),
    ('T12', 2, 'available'),
    ('T13', 4, 'available'),
    ('T14', 6, 'available'),
    ('T15', 2, 'available'),
    ('T16', 4, 'available'),
    ('T17', 6, 'available'),
    ('T18', 2, 'available'),
    ('T19', 4, 'available'),
    ('T20', 6, 'available');

-- Reservations
INSERT INTO
    Reservations (
        customerName,
        tableId,
        reservationDate,
        reservationTime,
        headCount,
        specialRequest
    )
VALUES
    (
        'Alice Johnson',
        1,
        '2025-01-05',
        '18:30:00',
        4,
        'Window seat'
    );

-- Card Payments
INSERT INTO
    CardPayments (cardNumber, cardHolderName, expiryDate, cvv)
VALUES
    (
        '1234567812345678',
        'Alice Johnson',
        '2026-12-01',
        123
    );

-- Bills
INSERT INTO
    Bills (
        staffId,
        reservationId,
        tableId,
        cardId,
        totalAmount,
        paymentMethod
    )
VALUES
    (1, 1, 1, 1, 25.99, 'card');

-- Bill Items
INSERT INTO
    BillItems (billId, itemId, quantity)
VALUES
    (1, 'M001', 2),
    (1, 'M004', 3);

-- Kitchen Orders
INSERT INTO
    KitchenOrders (billId, staffId, itemId, quantity, status)
VALUES
    (1, 2, 'M001', 2, 'completed'),
    (1, 2, 'M003', 1, 'pending');