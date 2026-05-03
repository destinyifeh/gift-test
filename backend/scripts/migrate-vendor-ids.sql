UPDATE transactions SET vendor_id = v.id FROM vendors v WHERE transactions.user_id = v.user_id AND transactions.vendor_id IS NULL;
UPDATE bank_accounts SET vendor_id = v.id FROM vendors v WHERE bank_accounts.user_id = v.user_id AND bank_accounts.vendor_id IS NULL;
UPDATE withdrawals SET vendor_id = v.id FROM vendors v WHERE withdrawals.user_id = v.user_id AND withdrawals.vendor_id IS NULL;
UPDATE notifications SET vendor_id = v.id FROM vendors v WHERE notifications.user_id = v.user_id AND notifications.vendor_id IS NULL;
UPDATE featured_ads SET vendor_id = v.id FROM vendors v WHERE featured_ads.user_id = v.user_id AND featured_ads.vendor_id IS NULL;
UPDATE sponsored_ads SET vendor_id = v.id FROM vendors v WHERE sponsored_ads.user_id = v.user_id AND sponsored_ads.vendor_id IS NULL;
UPDATE vendor_accepted_gift_cards SET vendor_id = v.id FROM vendors v WHERE vendor_accepted_gift_cards.vendor_id = v.user_id;

-- Backfill redemptions
UPDATE campaigns SET redeemed_by_vendor_id = v.id FROM vendors v WHERE campaigns.redeemed_by_vendor_id = v.user_id;
UPDATE direct_gifts SET redeemed_by_vendor_id = v.id FROM vendors v WHERE direct_gifts.redeemed_by_vendor_id = v.user_id;
UPDATE flex_card_transactions SET vendor_id = v.id FROM vendors v WHERE flex_card_transactions.vendor_id = v.user_id;
UPDATE user_gift_card_transactions SET vendor_id = v.id FROM vendors v WHERE user_gift_card_transactions.vendor_id = v.user_id;
