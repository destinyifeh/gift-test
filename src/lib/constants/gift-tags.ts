/**
 * Predefined gift tags used across the platform.
 * Vendors can select multiple tags when adding/editing a product.
 * The gift shop uses these same tags for filtering.
 */
export const GIFT_TAGS = [
  'Birthday',
  'Anniversary',
  'Corporate',
  'Wedding',
  'Men',
  'Women',
  'Kids',
  'Home',
  'Digital',
  'Wellness',
  'Gourmet',
  'Spa',
  'Fashion',
  'Food',
  'Tech',
  'Books',
  'Sports',
  'Travel',
  'Luxury',
  'Handmade',
] as const;

export type GiftTag = (typeof GIFT_TAGS)[number];
