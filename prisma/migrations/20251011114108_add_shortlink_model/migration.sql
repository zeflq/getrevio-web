-- CreateTable
CREATE TABLE "Shortlink" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "target" JSONB NOT NULL,
    "channel" TEXT,
    "themeId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "utm" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shortlink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shortlink_code_key" ON "Shortlink"("code");

-- AddForeignKey
ALTER TABLE "Shortlink" ADD CONSTRAINT "Shortlink_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
