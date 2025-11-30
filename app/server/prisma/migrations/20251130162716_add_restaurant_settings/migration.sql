-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" VARCHAR(200) NOT NULL,
    "tagline" VARCHAR(500),
    "description" TEXT,
    "aboutTitle" VARCHAR(200),
    "aboutContent" TEXT,
    "address" VARCHAR(500),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "mapEmbedUrl" TEXT,
    "heroImage" VARCHAR(500),
    "aboutImage" VARCHAR(500),
    "logoUrl" VARCHAR(500),
    "operatingHours" JSONB,
    "socialLinks" JSONB,
    "highlights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);
