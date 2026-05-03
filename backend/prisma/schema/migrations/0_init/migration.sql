-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'vendor', 'superadmin');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('support', 'finance', 'moderator', 'superadmin');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "is_creator" BOOLEAN NOT NULL DEFAULT false,
    "suggested_amounts" INTEGER[] DEFAULT ARRAY[5, 10, 25]::INTEGER[],
    "social_links" JSONB DEFAULT '{}',
    "theme_settings" JSONB DEFAULT '{}',
    "country" TEXT,
    "roles" "UserRole"[] DEFAULT ARRAY['user']::"UserRole"[],
    "admin_role" "AdminRole",
    "user_wallet" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "wallet_status" TEXT NOT NULL DEFAULT 'active',
    "suspension_end" TIMESTAMP(3),
    "vendor_wallet" BIGINT NOT NULL DEFAULT 0,
    "business_name" TEXT,
    "business_description" TEXT,
    "business_address" TEXT,
    "business_slug" TEXT,
    "business_logo_url" TEXT,
    "banner_url" TEXT,
    "is_verified_vendor" BOOLEAN NOT NULL DEFAULT false,
    "vendor_status" TEXT NOT NULL DEFAULT 'pending',
    "vendor_categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "business_street" TEXT,
    "business_city" TEXT,
    "business_state" TEXT,
    "business_country" TEXT,
    "business_zip" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goal_amount" DECIMAL(65,30),
    "min_amount" DECIMAL(65,30),
    "current_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "end_date" TIMESTAMP(3),
    "image_url" TEXT,
    "cover_image" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "contributors_see_each_other" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "status_reason" TEXT,
    "paused_by" TEXT,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "flag_reason" TEXT,
    "flagged_at" TIMESTAMP(3),
    "flagged_by" TEXT,
    "campaign_short_id" TEXT,
    "campaign_slug" TEXT,
    "claimable_type" TEXT,
    "claimable_gift_id" INTEGER,
    "gift_card_id" INTEGER,
    "claimable_recipient_type" TEXT,
    "recipient_email" TEXT,
    "sender_email" TEXT,
    "payment_reference" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "gift_code" TEXT,
    "redeemed_at" TIMESTAMP(3),
    "redeemed_by_vendor_id" TEXT,
    "vendor_rating" INTEGER,
    "message" TEXT,
    "delivery_method" TEXT DEFAULT 'email',
    "recipient_phone" TEXT,
    "recipient_country_code" TEXT,
    "whatsapp_fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sender_name" TEXT,
    "withdrawn_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_withdrawals" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "donor_name" TEXT NOT NULL,
    "donor_email" TEXT,
    "message" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "hide_amount" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_gifts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL DEFAULT 'active',
    "claimable_type" TEXT,
    "claimable_gift_id" INTEGER,
    "gift_card_id" INTEGER,
    "claimable_recipient_type" TEXT,
    "recipient_email" TEXT,
    "sender_email" TEXT,
    "payment_reference" TEXT,
    "gift_code" TEXT,
    "redeemed_at" TIMESTAMP(3),
    "redeemed_by_vendor_id" TEXT,
    "vendor_rating" INTEGER,
    "message" TEXT,
    "delivery_method" TEXT DEFAULT 'email',
    "recipient_phone" TEXT,
    "recipient_country_code" TEXT,
    "whatsapp_fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sender_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direct_gifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_ads" (
    "id" SERIAL NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "vendor_gift_id" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "slot_number" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "amount_paid" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "payment_reference" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsored_ads" (
    "id" SERIAL NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "vendor_gift_id" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "budget" DECIMAL(65,30) NOT NULL,
    "remaining_budget" DECIMAL(65,30) NOT NULL,
    "cost_per_click" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "payment_reference" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsored_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_promotions" (
    "id" SERIAL NOT NULL,
    "adminId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "link" TEXT,
    "placement" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_items" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "link" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "featured_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "campaign_id" TEXT,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reference" TEXT,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "bank_code" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "recipient_code" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "country" TEXT NOT NULL DEFAULT 'Nigeria',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reference" TEXT,
    "rejection_reason" TEXT,
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flex_cards" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "senderId" TEXT,
    "initialAmount" DECIMAL(65,30) NOT NULL,
    "currentBalance" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "code" TEXT NOT NULL,
    "claimToken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "senderName" TEXT,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'email',
    "message" TEXT,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flex_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flex_card_transactions" (
    "id" SERIAL NOT NULL,
    "flexCardId" INTEGER NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flex_card_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "color_from" TEXT,
    "color_to" TEXT,
    "image_url" TEXT,
    "amountOptions" JSONB NOT NULL DEFAULT '[]',
    "allow_custom_amount" BOOLEAN NOT NULL DEFAULT true,
    "min_amount" DECIMAL(65,30) NOT NULL DEFAULT 500,
    "max_amount" DECIMAL(65,30) NOT NULL DEFAULT 500000,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "service_fee_percent" DECIMAL(65,30) NOT NULL DEFAULT 4,
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_flex_card" BOOLEAN NOT NULL DEFAULT false,
    "usage_description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_accepted_gift_cards" (
    "id" SERIAL NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "gift_card_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_accepted_gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_reports" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetName" TEXT,
    "reporterId" TEXT,
    "reporterUsername" TEXT NOT NULL DEFAULT 'anonymous',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolutionNotes" TEXT,
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_tickets" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" SERIAL NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_support" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT,
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "hideAmount" BOOLEAN NOT NULL DEFAULT false,
    "giftId" INTEGER,
    "giftName" TEXT,
    "vendorRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_support_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "target_role" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_reads" (
    "id" SERIAL NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_configs" (
    "id" TEXT NOT NULL,
    "country_name" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "currency_symbol" TEXT NOT NULL,
    "flag" TEXT NOT NULL DEFAULT '🏳️',
    "transaction_fee_percent" DECIMAL(65,30) NOT NULL DEFAULT 4,
    "withdrawal_fee_flat" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "min_withdrawal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "max_withdrawal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL DEFAULT '{"creatorSupport": true, "vendorShop": true, "campaigns": true, "flexCard": true, "directGift": true, "withdrawals": true, "accessRules": {}}',
    "ad_config" JSONB DEFAULT '{}',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_gift_cards" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "senderId" TEXT,
    "giftCardId" INTEGER NOT NULL,
    "initialAmount" DECIMAL(65,30) NOT NULL,
    "currentBalance" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "code" TEXT NOT NULL,
    "claimToken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "senderName" TEXT,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'email',
    "message" TEXT,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_gift_card_transactions" (
    "id" SERIAL NOT NULL,
    "userGiftCardId" INTEGER NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_gift_card_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_gifts" (
    "id" SERIAL NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "product_short_id" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "category_id" INTEGER,
    "subcategory_id" INTEGER,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" TEXT NOT NULL DEFAULT 'digital',
    "status" TEXT NOT NULL DEFAULT 'active',
    "stock_quantity" INTEGER,
    "units_sold" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "clicks_count" INTEGER NOT NULL DEFAULT 0,
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "ranking_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_engagement_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_gifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_gift_images" (
    "id" SERIAL NOT NULL,
    "gift_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_gift_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "vendor_gift_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" SERIAL NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_subcategories" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "id" SERIAL NOT NULL,
    "subcategory_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_gift_tags" (
    "gift_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "vendor_gift_tags_pkey" PRIMARY KEY ("gift_id","tag_id")
);

-- CreateTable
CREATE TABLE "tag_requests" (
    "id" SERIAL NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "subcategory_id" INTEGER NOT NULL,
    "tag_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_business_slug_key" ON "users"("business_slug");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_campaign_short_id_key" ON "campaigns"("campaign_short_id");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_withdrawals_transaction_id_key" ON "campaign_withdrawals"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_transaction_id_key" ON "contributions"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "direct_gifts_gift_code_key" ON "direct_gifts"("gift_code");

-- CreateIndex
CREATE UNIQUE INDEX "featured_ads_transaction_id_key" ON "featured_ads"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "sponsored_ads_transaction_id_key" ON "sponsored_ads"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_reference_key" ON "withdrawals"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_transaction_id_key" ON "withdrawals"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "flex_cards_code_key" ON "flex_cards"("code");

-- CreateIndex
CREATE UNIQUE INDEX "flex_cards_claimToken_key" ON "flex_cards"("claimToken");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_slug_key" ON "gift_cards"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_accepted_gift_cards_vendor_id_gift_card_id_key" ON "vendor_accepted_gift_cards"("vendor_id", "gift_card_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_support_transactionId_key" ON "creator_support"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_reads_notification_id_user_id_key" ON "notification_reads"("notification_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "country_configs_country_name_key" ON "country_configs"("country_name");

-- CreateIndex
CREATE UNIQUE INDEX "country_configs_country_code_key" ON "country_configs"("country_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_gift_cards_code_key" ON "user_gift_cards"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_gift_cards_claimToken_key" ON "user_gift_cards"("claimToken");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_gifts_product_short_id_key" ON "vendor_gifts"("product_short_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_vendor_gift_id_key" ON "favorites"("user_id", "vendor_gift_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_subcategories_category_id_name_key" ON "product_subcategories"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "product_subcategories_category_id_slug_key" ON "product_subcategories"("category_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_tags_subcategory_id_name_key" ON "product_tags"("subcategory_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "product_tags_subcategory_id_slug_key" ON "product_tags"("subcategory_id", "slug");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_claimable_gift_id_fkey" FOREIGN KEY ("claimable_gift_id") REFERENCES "vendor_gifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_gift_card_id_fkey" FOREIGN KEY ("gift_card_id") REFERENCES "gift_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_redeemed_by_vendor_id_fkey" FOREIGN KEY ("redeemed_by_vendor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_withdrawals" ADD CONSTRAINT "campaign_withdrawals_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_withdrawals" ADD CONSTRAINT "campaign_withdrawals_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_gifts" ADD CONSTRAINT "direct_gifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_gifts" ADD CONSTRAINT "direct_gifts_claimable_gift_id_fkey" FOREIGN KEY ("claimable_gift_id") REFERENCES "vendor_gifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_gifts" ADD CONSTRAINT "direct_gifts_gift_card_id_fkey" FOREIGN KEY ("gift_card_id") REFERENCES "gift_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_gifts" ADD CONSTRAINT "direct_gifts_redeemed_by_vendor_id_fkey" FOREIGN KEY ("redeemed_by_vendor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_ads" ADD CONSTRAINT "featured_ads_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_ads" ADD CONSTRAINT "featured_ads_vendor_gift_id_fkey" FOREIGN KEY ("vendor_gift_id") REFERENCES "vendor_gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_ads" ADD CONSTRAINT "featured_ads_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_ads" ADD CONSTRAINT "sponsored_ads_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_ads" ADD CONSTRAINT "sponsored_ads_vendor_gift_id_fkey" FOREIGN KEY ("vendor_gift_id") REFERENCES "vendor_gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_ads" ADD CONSTRAINT "sponsored_ads_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_promotions" ADD CONSTRAINT "external_promotions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flex_cards" ADD CONSTRAINT "flex_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flex_cards" ADD CONSTRAINT "flex_cards_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flex_card_transactions" ADD CONSTRAINT "flex_card_transactions_flexCardId_fkey" FOREIGN KEY ("flexCardId") REFERENCES "flex_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flex_card_transactions" ADD CONSTRAINT "flex_card_transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_accepted_gift_cards" ADD CONSTRAINT "vendor_accepted_gift_cards_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_accepted_gift_cards" ADD CONSTRAINT "vendor_accepted_gift_cards_gift_card_id_fkey" FOREIGN KEY ("gift_card_id") REFERENCES "gift_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_tickets" ADD CONSTRAINT "moderation_tickets_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_tickets" ADD CONSTRAINT "moderation_tickets_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_support" ADD CONSTRAINT "creator_support_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_support" ADD CONSTRAINT "creator_support_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gift_cards" ADD CONSTRAINT "user_gift_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gift_cards" ADD CONSTRAINT "user_gift_cards_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gift_cards" ADD CONSTRAINT "user_gift_cards_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "gift_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gift_card_transactions" ADD CONSTRAINT "user_gift_card_transactions_userGiftCardId_fkey" FOREIGN KEY ("userGiftCardId") REFERENCES "user_gift_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gift_card_transactions" ADD CONSTRAINT "user_gift_card_transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_gifts" ADD CONSTRAINT "vendor_gifts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_gifts" ADD CONSTRAINT "vendor_gifts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_gifts" ADD CONSTRAINT "vendor_gifts_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "product_subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_gift_images" ADD CONSTRAINT "vendor_gift_images_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "vendor_gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_vendor_gift_id_fkey" FOREIGN KEY ("vendor_gift_id") REFERENCES "vendor_gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subcategories" ADD CONSTRAINT "product_subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "product_subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_gift_tags" ADD CONSTRAINT "vendor_gift_tags_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "vendor_gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_gift_tags" ADD CONSTRAINT "vendor_gift_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "product_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_requests" ADD CONSTRAINT "tag_requests_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_requests" ADD CONSTRAINT "tag_requests_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "product_subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

