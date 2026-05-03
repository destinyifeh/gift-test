/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bank_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `campaign_withdrawals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contributions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `country_configs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `creator_support` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `direct_gifts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `external_promotions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `featured_ads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `featured_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `flex_card_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `flex_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gift_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `moderation_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `moderation_tickets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_reads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_subcategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ratings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sponsored_ads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tag_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_gift_card_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_gift_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_accepted_gift_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_gift_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_gift_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_gifts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `withdrawals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "admin_logs" DROP CONSTRAINT "admin_logs_adminId_fkey";

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "campaign_withdrawals" DROP CONSTRAINT "campaign_withdrawals_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "campaign_withdrawals" DROP CONSTRAINT "campaign_withdrawals_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_claimable_gift_id_fkey";

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_gift_card_id_fkey";

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_redeemed_by_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_user_id_fkey";

-- DropForeignKey
ALTER TABLE "contributions" DROP CONSTRAINT "contributions_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "contributions" DROP CONSTRAINT "contributions_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "creator_support" DROP CONSTRAINT "creator_support_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "creator_support" DROP CONSTRAINT "creator_support_userId_fkey";

-- DropForeignKey
ALTER TABLE "direct_gifts" DROP CONSTRAINT "direct_gifts_claimable_gift_id_fkey";

-- DropForeignKey
ALTER TABLE "direct_gifts" DROP CONSTRAINT "direct_gifts_gift_card_id_fkey";

-- DropForeignKey
ALTER TABLE "direct_gifts" DROP CONSTRAINT "direct_gifts_redeemed_by_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "direct_gifts" DROP CONSTRAINT "direct_gifts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "external_promotions" DROP CONSTRAINT "external_promotions_adminId_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_user_id_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_vendor_gift_id_fkey";

-- DropForeignKey
ALTER TABLE "featured_ads" DROP CONSTRAINT "featured_ads_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "featured_ads" DROP CONSTRAINT "featured_ads_vendor_gift_id_fkey";

-- DropForeignKey
ALTER TABLE "featured_ads" DROP CONSTRAINT "featured_ads_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "flex_card_transactions" DROP CONSTRAINT "flex_card_transactions_flexCardId_fkey";

-- DropForeignKey
ALTER TABLE "flex_card_transactions" DROP CONSTRAINT "flex_card_transactions_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "flex_cards" DROP CONSTRAINT "flex_cards_senderId_fkey";

-- DropForeignKey
ALTER TABLE "flex_cards" DROP CONSTRAINT "flex_cards_userId_fkey";

-- DropForeignKey
ALTER TABLE "moderation_reports" DROP CONSTRAINT "moderation_reports_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "moderation_reports" DROP CONSTRAINT "moderation_reports_resolvedById_fkey";

-- DropForeignKey
ALTER TABLE "moderation_tickets" DROP CONSTRAINT "moderation_tickets_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "moderation_tickets" DROP CONSTRAINT "moderation_tickets_resolvedById_fkey";

-- DropForeignKey
ALTER TABLE "notification_reads" DROP CONSTRAINT "notification_reads_notification_id_fkey";

-- DropForeignKey
ALTER TABLE "notification_reads" DROP CONSTRAINT "notification_reads_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "product_subcategories" DROP CONSTRAINT "product_subcategories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "product_tags" DROP CONSTRAINT "product_tags_subcategory_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "sponsored_ads" DROP CONSTRAINT "sponsored_ads_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "sponsored_ads" DROP CONSTRAINT "sponsored_ads_vendor_gift_id_fkey";

-- DropForeignKey
ALTER TABLE "sponsored_ads" DROP CONSTRAINT "sponsored_ads_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "tag_requests" DROP CONSTRAINT "tag_requests_subcategory_id_fkey";

-- DropForeignKey
ALTER TABLE "tag_requests" DROP CONSTRAINT "tag_requests_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_gift_card_transactions" DROP CONSTRAINT "user_gift_card_transactions_userGiftCardId_fkey";

-- DropForeignKey
ALTER TABLE "user_gift_card_transactions" DROP CONSTRAINT "user_gift_card_transactions_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "user_gift_cards" DROP CONSTRAINT "user_gift_cards_giftCardId_fkey";

-- DropForeignKey
ALTER TABLE "user_gift_cards" DROP CONSTRAINT "user_gift_cards_senderId_fkey";

-- DropForeignKey
ALTER TABLE "user_gift_cards" DROP CONSTRAINT "user_gift_cards_userId_fkey";

-- DropForeignKey
ALTER TABLE "vendor_accepted_gift_cards" DROP CONSTRAINT "vendor_accepted_gift_cards_gift_card_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor_accepted_gift_cards" DROP CONSTRAINT "vendor_accepted_gift_cards_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor_gift_images" DROP CONSTRAINT "vendor_gift_images_gift_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor_gift_tags" DROP CONSTRAINT "vendor_gift_tags_gift_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor_gift_tags" DROP CONSTRAINT "vendor_gift_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor_gifts" DROP CONSTRAINT "vendor_gifts_category_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor_gifts" DROP CONSTRAINT "vendor_gifts_subcategory_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor_gifts" DROP CONSTRAINT "vendor_gifts_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "withdrawals" DROP CONSTRAINT "withdrawals_bank_account_id_fkey";

-- DropForeignKey
ALTER TABLE "withdrawals" DROP CONSTRAINT "withdrawals_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "withdrawals" DROP CONSTRAINT "withdrawals_user_id_fkey";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "admin_logs";

-- DropTable
DROP TABLE "bank_accounts";

-- DropTable
DROP TABLE "campaign_withdrawals";

-- DropTable
DROP TABLE "campaigns";

-- DropTable
DROP TABLE "contributions";

-- DropTable
DROP TABLE "country_configs";

-- DropTable
DROP TABLE "creator_support";

-- DropTable
DROP TABLE "direct_gifts";

-- DropTable
DROP TABLE "external_promotions";

-- DropTable
DROP TABLE "favorites";

-- DropTable
DROP TABLE "featured_ads";

-- DropTable
DROP TABLE "featured_items";

-- DropTable
DROP TABLE "flex_card_transactions";

-- DropTable
DROP TABLE "flex_cards";

-- DropTable
DROP TABLE "gift_cards";

-- DropTable
DROP TABLE "moderation_reports";

-- DropTable
DROP TABLE "moderation_tickets";

-- DropTable
DROP TABLE "notification_reads";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "product_categories";

-- DropTable
DROP TABLE "product_subcategories";

-- DropTable
DROP TABLE "product_tags";

-- DropTable
DROP TABLE "ratings";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "sponsored_ads";

-- DropTable
DROP TABLE "system_settings";

-- DropTable
DROP TABLE "tag_requests";

-- DropTable
DROP TABLE "transactions";

-- DropTable
DROP TABLE "user_gift_card_transactions";

-- DropTable
DROP TABLE "user_gift_cards";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "vendor_accepted_gift_cards";

-- DropTable
DROP TABLE "vendor_gift_images";

-- DropTable
DROP TABLE "vendor_gift_tags";

-- DropTable
DROP TABLE "vendor_gifts";

-- DropTable
DROP TABLE "verifications";

-- DropTable
DROP TABLE "withdrawals";

-- DropEnum
DROP TYPE "AdminRole";

-- DropEnum
DROP TYPE "UserRole";
