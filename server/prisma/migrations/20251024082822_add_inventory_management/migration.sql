-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('in', 'out', 'adjustment', 'waste');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('pending', 'ordered', 'received', 'cancelled');

-- CreateEnum
CREATE TYPE "StockAlertType" AS ENUM ('low_stock', 'expiring_soon', 'expired');

-- CreateTable
CREATE TABLE "ingredient_categories" (
    "categoryId" SERIAL NOT NULL,
    "categoryName" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_categories_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "ingredientId" SERIAL NOT NULL,
    "ingredientCode" VARCHAR(20) NOT NULL,
    "ingredientName" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "categoryId" INTEGER,
    "minimumStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currentStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("ingredientId")
);

-- CreateTable
CREATE TABLE "recipes" (
    "recipeId" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("recipeId")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "supplierId" SERIAL NOT NULL,
    "supplierCode" VARCHAR(20) NOT NULL,
    "supplierName" VARCHAR(255) NOT NULL,
    "contactPerson" VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "taxCode" VARCHAR(50),
    "paymentTerms" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("supplierId")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "purchaseOrderId" SERIAL NOT NULL,
    "orderNumber" VARCHAR(50) NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "staffId" INTEGER,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" DATE,
    "receivedDate" TIMESTAMP(3),
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'pending',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("purchaseOrderId")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "itemId" SERIAL NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "receivedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "stock_transactions" (
    "transactionId" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "referenceType" VARCHAR(50),
    "referenceId" INTEGER,
    "staffId" INTEGER,
    "notes" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "ingredient_batches" (
    "batchId" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "purchaseOrderId" INTEGER,
    "batchNumber" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "remainingQuantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "unitCost" DECIMAL(10,2),
    "expiryDate" DATE,
    "receivedDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_batches_pkey" PRIMARY KEY ("batchId")
);

-- CreateTable
CREATE TABLE "stock_alerts" (
    "alertId" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "alertType" "StockAlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("alertId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_categories_categoryName_key" ON "ingredient_categories"("categoryName");

-- CreateIndex
CREATE INDEX "ingredient_categories_isActive_idx" ON "ingredient_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_ingredientCode_key" ON "ingredients"("ingredientCode");

-- CreateIndex
CREATE INDEX "ingredients_categoryId_idx" ON "ingredients"("categoryId");

-- CreateIndex
CREATE INDEX "ingredients_isActive_idx" ON "ingredients"("isActive");

-- CreateIndex
CREATE INDEX "recipes_itemId_idx" ON "recipes"("itemId");

-- CreateIndex
CREATE INDEX "recipes_ingredientId_idx" ON "recipes"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_itemId_ingredientId_key" ON "recipes"("itemId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE INDEX "suppliers_isActive_idx" ON "suppliers"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_orderNumber_key" ON "purchase_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_orderNumber_idx" ON "purchase_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "purchase_orders_orderDate_idx" ON "purchase_orders"("orderDate");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchaseOrderId_idx" ON "purchase_order_items"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "purchase_order_items_ingredientId_idx" ON "purchase_order_items"("ingredientId");

-- CreateIndex
CREATE INDEX "stock_transactions_ingredientId_idx" ON "stock_transactions"("ingredientId");

-- CreateIndex
CREATE INDEX "stock_transactions_transactionType_idx" ON "stock_transactions"("transactionType");

-- CreateIndex
CREATE INDEX "stock_transactions_transactionDate_idx" ON "stock_transactions"("transactionDate");

-- CreateIndex
CREATE INDEX "ingredient_batches_ingredientId_idx" ON "ingredient_batches"("ingredientId");

-- CreateIndex
CREATE INDEX "ingredient_batches_purchaseOrderId_idx" ON "ingredient_batches"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "ingredient_batches_expiryDate_idx" ON "ingredient_batches"("expiryDate");

-- CreateIndex
CREATE INDEX "stock_alerts_ingredientId_idx" ON "stock_alerts"("ingredientId");

-- CreateIndex
CREATE INDEX "stock_alerts_alertType_idx" ON "stock_alerts"("alertType");

-- CreateIndex
CREATE INDEX "stock_alerts_isResolved_idx" ON "stock_alerts"("isResolved");

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ingredient_categories"("categoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "menu_items"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("staffId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("purchaseOrderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("staffId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_batches" ADD CONSTRAINT "ingredient_batches_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_batches" ADD CONSTRAINT "ingredient_batches_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("purchaseOrderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("ingredientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "staff"("staffId") ON DELETE SET NULL ON UPDATE CASCADE;
