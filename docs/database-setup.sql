-- ============================================
-- Restaurant Management System - Database Setup
-- PostgreSQL 16+
-- ============================================
-- This script creates all tables, enums, indexes, and constraints
-- for the restaurant management system including inventory management.
-- ============================================

-- Drop existing schema if needed (CAUTION: This will delete all data)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- ============================================
-- ENUMERATIONS
-- ============================================

-- Staff roles
CREATE TYPE "Role" AS ENUM (
  'admin',
  'manager',
  'waiter',
  'chef',
  'bartender',
  'cashier'
);

-- Table status
CREATE TYPE "TableStatus" AS ENUM (
  'available',
  'occupied',
  'reserved',
  'maintenance'
);

-- Order status
CREATE TYPE "OrderStatus" AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'cancelled'
);

-- Payment status
CREATE TYPE "PaymentStatus" AS ENUM (
  'pending',
  'paid',
  'refunded',
  'cancelled'
);

-- Payment methods
CREATE TYPE "PaymentMethod" AS ENUM (
  'cash',
  'card',
  'momo',
  'bank_transfer'
);

-- Reservation status
CREATE TYPE "ReservationStatus" AS ENUM (
  'pending',
  'confirmed',
  'seated',
  'completed',
  'cancelled',
  'no_show'
);

-- ============================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================

-- Accounts table
CREATE TABLE "accounts" (
  "accountId" SERIAL PRIMARY KEY,
  "username" VARCHAR(50) UNIQUE NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "phoneNumber" VARCHAR(20) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Refresh tokens table
CREATE TABLE "refresh_tokens" (
  "tokenId" SERIAL PRIMARY KEY,
  "accountId" INT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "deviceInfo" VARCHAR(500),
  "ipAddress" VARCHAR(45),
  "isRevoked" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "revokedAt" TIMESTAMP,
  FOREIGN KEY ("accountId") REFERENCES "accounts"("accountId") ON DELETE CASCADE
);

-- Staff table
CREATE TABLE "staff" (
  "staffId" SERIAL PRIMARY KEY,
  "accountId" INT UNIQUE NOT NULL,
  "fullName" VARCHAR(255) NOT NULL,
  "address" VARCHAR(500),
  "dateOfBirth" DATE,
  "hireDate" DATE DEFAULT CURRENT_DATE NOT NULL,
  "salary" DECIMAL(12,2),
  "role" "Role" NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES "accounts"("accountId") ON DELETE CASCADE
);

-- ============================================
-- MENU & CATEGORY MANAGEMENT
-- ============================================

-- Categories table
CREATE TABLE "categories" (
  "categoryId" SERIAL PRIMARY KEY,
  "categoryName" VARCHAR(100) UNIQUE NOT NULL,
  "description" VARCHAR(500),
  "displayOrder" INT DEFAULT 0 NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "imageUrl" VARCHAR(500),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Menu items table
CREATE TABLE "menu_items" (
  "itemId" SERIAL PRIMARY KEY,
  "itemCode" VARCHAR(20) UNIQUE NOT NULL,
  "itemName" VARCHAR(100) NOT NULL,
  "categoryId" INT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "cost" DECIMAL(10,2),
  "description" VARCHAR(1000),
  "imageUrl" VARCHAR(500),
  "isAvailable" BOOLEAN DEFAULT true NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "preparationTime" INT,
  "spicyLevel" INT DEFAULT 0,
  "isVegetarian" BOOLEAN DEFAULT false NOT NULL,
  "calories" INT,
  "displayOrder" INT DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("categoryId") REFERENCES "categories"("categoryId") ON DELETE RESTRICT
);

-- ============================================
-- TABLE MANAGEMENT
-- ============================================

-- Restaurant tables
CREATE TABLE "restaurant_tables" (
  "tableId" SERIAL PRIMARY KEY,
  "tableNumber" VARCHAR(20) UNIQUE NOT NULL,
  "tableName" VARCHAR(50),
  "capacity" INT NOT NULL,
  "minCapacity" INT DEFAULT 1 NOT NULL,
  "floor" INT DEFAULT 1 NOT NULL,
  "section" VARCHAR(50),
  "status" "TableStatus" DEFAULT 'available' NOT NULL,
  "qrCode" VARCHAR(255) UNIQUE,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- RESERVATION MANAGEMENT
-- ============================================

-- Reservations table
CREATE TABLE "reservations" (
  "reservationId" SERIAL PRIMARY KEY,
  "reservationCode" VARCHAR(50) UNIQUE DEFAULT gen_random_uuid()::TEXT NOT NULL,
  "customerName" VARCHAR(255) NOT NULL,
  "phoneNumber" VARCHAR(20) NOT NULL,
  "email" VARCHAR(255),
  "tableId" INT NOT NULL,
  "reservationDate" DATE NOT NULL,
  "reservationTime" TIME(0) NOT NULL,
  "duration" INT DEFAULT 120 NOT NULL,
  "headCount" INT NOT NULL,
  "specialRequest" TEXT,
  "depositAmount" DECIMAL(10,2),
  "status" "ReservationStatus" DEFAULT 'pending' NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("tableId") REFERENCES "restaurant_tables"("tableId") ON DELETE RESTRICT
);

-- ============================================
-- ORDER MANAGEMENT
-- ============================================

-- Orders table
CREATE TABLE "orders" (
  "orderId" SERIAL PRIMARY KEY,
  "orderNumber" VARCHAR(50) UNIQUE DEFAULT gen_random_uuid()::TEXT NOT NULL,
  "tableId" INT NOT NULL,
  "staffId" INT,
  "reservationId" INT,
  "customerName" VARCHAR(255),
  "customerPhone" VARCHAR(20),
  "headCount" INT DEFAULT 1 NOT NULL,
  "status" "OrderStatus" DEFAULT 'pending' NOT NULL,
  "notes" TEXT,
  "orderTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "confirmedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("tableId") REFERENCES "restaurant_tables"("tableId") ON DELETE RESTRICT,
  FOREIGN KEY ("staffId") REFERENCES "staff"("staffId") ON DELETE SET NULL,
  FOREIGN KEY ("reservationId") REFERENCES "reservations"("reservationId") ON DELETE SET NULL
);

-- Order items table
CREATE TABLE "order_items" (
  "orderItemId" SERIAL PRIMARY KEY,
  "orderId" INT NOT NULL,
  "itemId" INT NOT NULL,
  "quantity" INT NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "specialRequest" VARCHAR(500),
  "status" "OrderStatus" DEFAULT 'pending' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE CASCADE,
  FOREIGN KEY ("itemId") REFERENCES "menu_items"("itemId") ON DELETE RESTRICT
);

-- ============================================
-- KITCHEN MANAGEMENT
-- ============================================

-- Kitchen orders table
CREATE TABLE "kitchen_orders" (
  "kitchenOrderId" SERIAL PRIMARY KEY,
  "orderId" INT NOT NULL,
  "staffId" INT,
  "priority" INT DEFAULT 0 NOT NULL,
  "status" "OrderStatus" DEFAULT 'pending' NOT NULL,
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "estimatedTime" INT,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE CASCADE,
  FOREIGN KEY ("staffId") REFERENCES "staff"("staffId") ON DELETE SET NULL
);

-- ============================================
-- BILLING & PAYMENT
-- ============================================

-- Bills table
CREATE TABLE "bills" (
  "billId" SERIAL PRIMARY KEY,
  "billNumber" VARCHAR(50) UNIQUE DEFAULT gen_random_uuid()::TEXT NOT NULL,
  "orderId" INT UNIQUE NOT NULL,
  "tableId" INT NOT NULL,
  "staffId" INT,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "taxAmount" DECIMAL(12,2) DEFAULT 0 NOT NULL,
  "taxRate" DECIMAL(5,2) DEFAULT 0 NOT NULL,
  "discountAmount" DECIMAL(12,2) DEFAULT 0 NOT NULL,
  "serviceCharge" DECIMAL(12,2) DEFAULT 0 NOT NULL,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "paidAmount" DECIMAL(12,2) DEFAULT 0 NOT NULL,
  "changeAmount" DECIMAL(12,2) DEFAULT 0 NOT NULL,
  "paymentStatus" "PaymentStatus" DEFAULT 'pending' NOT NULL,
  "paymentMethod" "PaymentMethod",
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "paidAt" TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE RESTRICT,
  FOREIGN KEY ("tableId") REFERENCES "restaurant_tables"("tableId") ON DELETE RESTRICT,
  FOREIGN KEY ("staffId") REFERENCES "staff"("staffId") ON DELETE SET NULL
);

-- Bill items table
CREATE TABLE "bill_items" (
  "billItemId" SERIAL PRIMARY KEY,
  "billId" INT NOT NULL,
  "itemId" INT NOT NULL,
  "itemName" VARCHAR(100) NOT NULL,
  "quantity" INT NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "discount" DECIMAL(10,2) DEFAULT 0 NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("billId") REFERENCES "bills"("billId") ON DELETE CASCADE,
  FOREIGN KEY ("itemId") REFERENCES "menu_items"("itemId") ON DELETE RESTRICT
);

-- Payments table
CREATE TABLE "payments" (
  "paymentId" SERIAL PRIMARY KEY,
  "billId" INT NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "transactionId" VARCHAR(100),
  "cardNumber" VARCHAR(20),
  "cardHolderName" VARCHAR(255),
  "status" "PaymentStatus" DEFAULT 'pending' NOT NULL,
  "notes" TEXT,
  "paymentDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("billId") REFERENCES "bills"("billId") ON DELETE CASCADE
);

-- ============================================
-- INVENTORY MANAGEMENT
-- ============================================

-- Suppliers table
CREATE TABLE "suppliers" (
  "supplierId" SERIAL PRIMARY KEY,
  "supplierCode" VARCHAR(20) UNIQUE NOT NULL,
  "supplierName" VARCHAR(255) NOT NULL,
  "contactPerson" VARCHAR(255),
  "phoneNumber" VARCHAR(20) NOT NULL,
  "email" VARCHAR(255),
  "address" TEXT,
  "taxId" VARCHAR(50),
  "paymentTerms" VARCHAR(100),
  "notes" TEXT,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Ingredients table
CREATE TABLE "ingredients" (
  "ingredientId" SERIAL PRIMARY KEY,
  "ingredientCode" VARCHAR(20) UNIQUE NOT NULL,
  "ingredientName" VARCHAR(255) NOT NULL,
  "categoryName" VARCHAR(100),
  "unit" VARCHAR(20) NOT NULL,
  "currentStock" DECIMAL(10,3) DEFAULT 0 NOT NULL,
  "minimumStock" DECIMAL(10,3) DEFAULT 0 NOT NULL,
  "maximumStock" DECIMAL(10,3),
  "reorderPoint" DECIMAL(10,3),
  "unitCost" DECIMAL(10,2),
  "supplierId" INT,
  "storageLocation" VARCHAR(100),
  "requiresBatchTracking" BOOLEAN DEFAULT false NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplierId") ON DELETE SET NULL
);

-- Recipe items table (ingredients needed for menu items)
CREATE TABLE "recipe_items" (
  "recipeItemId" SERIAL PRIMARY KEY,
  "itemId" INT NOT NULL,
  "ingredientId" INT NOT NULL,
  "quantity" DECIMAL(10,3) NOT NULL,
  "unit" VARCHAR(20) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("itemId") REFERENCES "menu_items"("itemId") ON DELETE CASCADE,
  FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE RESTRICT,
  UNIQUE ("itemId", "ingredientId")
);

-- Purchase orders table
CREATE TABLE "purchase_orders" (
  "purchaseOrderId" SERIAL PRIMARY KEY,
  "poNumber" VARCHAR(50) UNIQUE NOT NULL,
  "supplierId" INT NOT NULL,
  "staffId" INT,
  "orderDate" DATE DEFAULT CURRENT_DATE NOT NULL,
  "expectedDate" DATE,
  "receivedDate" DATE,
  "status" VARCHAR(20) DEFAULT 'pending' NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "taxAmount" DECIMAL(12,2) DEFAULT 0 NOT NULL,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplierId") ON DELETE RESTRICT,
  FOREIGN KEY ("staffId") REFERENCES "staff"("staffId") ON DELETE SET NULL,
  CHECK ("status" IN ('pending', 'confirmed', 'received', 'partially_received', 'cancelled'))
);

-- Purchase order items table
CREATE TABLE "purchase_order_items" (
  "poItemId" SERIAL PRIMARY KEY,
  "purchaseOrderId" INT NOT NULL,
  "ingredientId" INT NOT NULL,
  "quantity" DECIMAL(10,3) NOT NULL,
  "receivedQuantity" DECIMAL(10,3) DEFAULT 0 NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("purchaseOrderId") ON DELETE CASCADE,
  FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE RESTRICT
);

-- Ingredient batches table
CREATE TABLE "ingredient_batches" (
  "batchId" SERIAL PRIMARY KEY,
  "ingredientId" INT NOT NULL,
  "batchNumber" VARCHAR(50) NOT NULL,
  "quantity" DECIMAL(10,3) NOT NULL,
  "remainingQuantity" DECIMAL(10,3) NOT NULL,
  "unitCost" DECIMAL(10,2) NOT NULL,
  "supplierId" INT,
  "purchaseOrderId" INT,
  "receivedDate" DATE NOT NULL,
  "manufactureDate" DATE,
  "expiryDate" DATE,
  "storageLocation" VARCHAR(100),
  "status" VARCHAR(20) DEFAULT 'active' NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE CASCADE,
  FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplierId") ON DELETE SET NULL,
  FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("purchaseOrderId") ON DELETE SET NULL,
  CHECK ("status" IN ('active', 'expired', 'used', 'wasted'))
);

-- Stock transactions table
CREATE TABLE "stock_transactions" (
  "transactionId" SERIAL PRIMARY KEY,
  "ingredientId" INT NOT NULL,
  "batchId" INT,
  "transactionType" VARCHAR(20) NOT NULL,
  "quantity" DECIMAL(10,3) NOT NULL,
  "unit" VARCHAR(20) NOT NULL,
  "unitCost" DECIMAL(10,2),
  "totalCost" DECIMAL(12,2),
  "referenceType" VARCHAR(50),
  "referenceId" INT,
  "balanceBefore" DECIMAL(10,3) NOT NULL,
  "balanceAfter" DECIMAL(10,3) NOT NULL,
  "notes" TEXT,
  "staffId" INT,
  "transactionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE RESTRICT,
  FOREIGN KEY ("batchId") REFERENCES "ingredient_batches"("batchId") ON DELETE SET NULL,
  FOREIGN KEY ("staffId") REFERENCES "staff"("staffId") ON DELETE SET NULL,
  CHECK ("transactionType" IN ('purchase', 'usage', 'adjustment', 'waste', 'return', 'transfer'))
);

-- Stock alerts table
CREATE TABLE "stock_alerts" (
  "alertId" SERIAL PRIMARY KEY,
  "ingredientId" INT NOT NULL,
  "alertType" VARCHAR(20) NOT NULL,
  "currentStock" DECIMAL(10,3) NOT NULL,
  "thresholdValue" DECIMAL(10,3) NOT NULL,
  "severity" VARCHAR(20) DEFAULT 'medium' NOT NULL,
  "status" VARCHAR(20) DEFAULT 'active' NOT NULL,
  "acknowledgedBy" INT,
  "acknowledgedAt" TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "resolvedAt" TIMESTAMP,
  FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE CASCADE,
  FOREIGN KEY ("acknowledgedBy") REFERENCES "staff"("staffId") ON DELETE SET NULL,
  CHECK ("alertType" IN ('low_stock', 'reorder_point', 'out_of_stock', 'expiring_soon', 'expired')),
  CHECK ("severity" IN ('low', 'medium', 'high', 'critical')),
  CHECK ("status" IN ('active', 'acknowledged', 'resolved'))
);

-- ============================================
-- INDEXES
-- ============================================

-- Accounts indexes
CREATE INDEX "accounts_email_idx" ON "accounts"("email");
CREATE INDEX "accounts_username_idx" ON "accounts"("username");

-- Refresh tokens indexes
CREATE INDEX "refresh_tokens_accountId_idx" ON "refresh_tokens"("accountId");
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- Staff indexes
CREATE INDEX "staff_role_idx" ON "staff"("role");
CREATE INDEX "staff_isActive_idx" ON "staff"("isActive");

-- Categories indexes
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");

-- Menu items indexes
CREATE INDEX "menu_items_categoryId_idx" ON "menu_items"("categoryId");
CREATE INDEX "menu_items_isAvailable_idx" ON "menu_items"("isAvailable");
CREATE INDEX "menu_items_isActive_idx" ON "menu_items"("isActive");

-- Restaurant tables indexes
CREATE INDEX "restaurant_tables_status_idx" ON "restaurant_tables"("status");
CREATE INDEX "restaurant_tables_floor_idx" ON "restaurant_tables"("floor");
CREATE INDEX "restaurant_tables_isActive_idx" ON "restaurant_tables"("isActive");

-- Reservations indexes
CREATE INDEX "reservations_reservationDate_idx" ON "reservations"("reservationDate");
CREATE INDEX "reservations_status_idx" ON "reservations"("status");
CREATE INDEX "reservations_phoneNumber_idx" ON "reservations"("phoneNumber");
CREATE INDEX "reservations_tableId_idx" ON "reservations"("tableId");

-- Orders indexes
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");
CREATE INDEX "orders_tableId_idx" ON "orders"("tableId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_orderTime_idx" ON "orders"("orderTime");

-- Order items indexes
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_itemId_idx" ON "order_items"("itemId");
CREATE INDEX "order_items_status_idx" ON "order_items"("status");

-- Kitchen orders indexes
CREATE INDEX "kitchen_orders_orderId_idx" ON "kitchen_orders"("orderId");
CREATE INDEX "kitchen_orders_status_idx" ON "kitchen_orders"("status");
CREATE INDEX "kitchen_orders_priority_idx" ON "kitchen_orders"("priority");

-- Bills indexes
CREATE INDEX "bills_billNumber_idx" ON "bills"("billNumber");
CREATE INDEX "bills_orderId_idx" ON "bills"("orderId");
CREATE INDEX "bills_paymentStatus_idx" ON "bills"("paymentStatus");
CREATE INDEX "bills_createdAt_idx" ON "bills"("createdAt");

-- Bill items indexes
CREATE INDEX "bill_items_billId_idx" ON "bill_items"("billId");

-- Payments indexes
CREATE INDEX "payments_billId_idx" ON "payments"("billId");
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");

-- Suppliers indexes
CREATE INDEX "suppliers_isActive_idx" ON "suppliers"("isActive");

-- Ingredients indexes
CREATE INDEX "ingredients_supplierId_idx" ON "ingredients"("supplierId");
CREATE INDEX "ingredients_isActive_idx" ON "ingredients"("isActive");
CREATE INDEX "ingredients_currentStock_idx" ON "ingredients"("currentStock");

-- Recipe items indexes
CREATE INDEX "recipe_items_itemId_idx" ON "recipe_items"("itemId");
CREATE INDEX "recipe_items_ingredientId_idx" ON "recipe_items"("ingredientId");

-- Purchase orders indexes
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");
CREATE INDEX "purchase_orders_orderDate_idx" ON "purchase_orders"("orderDate");

-- Purchase order items indexes
CREATE INDEX "purchase_order_items_purchaseOrderId_idx" ON "purchase_order_items"("purchaseOrderId");
CREATE INDEX "purchase_order_items_ingredientId_idx" ON "purchase_order_items"("ingredientId");

-- Ingredient batches indexes
CREATE INDEX "ingredient_batches_ingredientId_idx" ON "ingredient_batches"("ingredientId");
CREATE INDEX "ingredient_batches_batchNumber_idx" ON "ingredient_batches"("batchNumber");
CREATE INDEX "ingredient_batches_expiryDate_idx" ON "ingredient_batches"("expiryDate");
CREATE INDEX "ingredient_batches_status_idx" ON "ingredient_batches"("status");

-- Stock transactions indexes
CREATE INDEX "stock_transactions_ingredientId_idx" ON "stock_transactions"("ingredientId");
CREATE INDEX "stock_transactions_transactionType_idx" ON "stock_transactions"("transactionType");
CREATE INDEX "stock_transactions_transactionDate_idx" ON "stock_transactions"("transactionDate");
CREATE INDEX "stock_transactions_referenceType_idx" ON "stock_transactions"("referenceType");

-- Stock alerts indexes
CREATE INDEX "stock_alerts_ingredientId_idx" ON "stock_alerts"("ingredientId");
CREATE INDEX "stock_alerts_status_idx" ON "stock_alerts"("status");
CREATE INDEX "stock_alerts_alertType_idx" ON "stock_alerts"("alertType");
CREATE INDEX "stock_alerts_createdAt_idx" ON "stock_alerts"("createdAt");

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updatedAt trigger to all relevant tables
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON "accounts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON "staff" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON "menu_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON "restaurant_tables" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON "reservations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON "order_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kitchen_orders_updated_at BEFORE UPDATE ON "kitchen_orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON "bills" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON "suppliers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON "ingredients" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_items_updated_at BEFORE UPDATE ON "recipe_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON "purchase_orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON "purchase_order_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredient_batches_updated_at BEFORE UPDATE ON "ingredient_batches" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE "accounts" IS 'User authentication and account management';
COMMENT ON TABLE "refresh_tokens" IS 'JWT refresh token management';
COMMENT ON TABLE "staff" IS 'Staff member information and roles';
COMMENT ON TABLE "categories" IS 'Menu item categories';
COMMENT ON TABLE "menu_items" IS 'Restaurant menu items with pricing and details';
COMMENT ON TABLE "restaurant_tables" IS 'Physical tables in the restaurant';
COMMENT ON TABLE "reservations" IS 'Customer table reservations';
COMMENT ON TABLE "orders" IS 'Customer orders';
COMMENT ON TABLE "order_items" IS 'Individual items in an order';
COMMENT ON TABLE "kitchen_orders" IS 'Kitchen order queue and tracking';
COMMENT ON TABLE "bills" IS 'Customer bills and invoices';
COMMENT ON TABLE "bill_items" IS 'Line items in bills';
COMMENT ON TABLE "payments" IS 'Payment transactions';
COMMENT ON TABLE "suppliers" IS 'Ingredient suppliers';
COMMENT ON TABLE "ingredients" IS 'Inventory ingredients and raw materials';
COMMENT ON TABLE "recipe_items" IS 'Recipe ingredients for menu items';
COMMENT ON TABLE "purchase_orders" IS 'Purchase orders for inventory';
COMMENT ON TABLE "purchase_order_items" IS 'Line items in purchase orders';
COMMENT ON TABLE "ingredient_batches" IS 'Ingredient batch tracking with expiry dates';
COMMENT ON TABLE "stock_transactions" IS 'All inventory stock movements';
COMMENT ON TABLE "stock_alerts" IS 'Automated stock level alerts';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Total tables created: 24';
  RAISE NOTICE 'Total enums created: 6';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run seed data if needed';
  RAISE NOTICE '  2. Configure application connection string';
  RAISE NOTICE '  3. Test database connectivity';
END $$;
