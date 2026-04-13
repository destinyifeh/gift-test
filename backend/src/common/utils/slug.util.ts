import { customAlphabet } from 'nanoid';

/**
 * Generates a URL-safe slug from a title string.
 * Mirrors frontend: src/lib/utils/slugs.ts → generateSlug
 */
export function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .trim()
    .replace(/ +/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Standard URL-safe alphabet (base62, 7 chars) — exact match to frontend
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7,
);

/**
 * Generates a short random identifier (7 chars, base62).
 * Mirrors frontend: src/lib/utils/slugs.ts → generateShortId
 */
export function generateShortId(): string {
  return nanoid();
}

/**
 * Generates a unique slug by appending a short suffix to avoid collisions.
 * Used when creating campaigns, shops, etc.
 */
export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  let slug = generateSlug(title);
  if (!slug) slug = 'item';
  if (!existingSlugs.includes(slug)) return slug;

  // Append short ID until unique
  let candidate = `${slug}-${generateShortId().toLowerCase()}`;
  while (existingSlugs.includes(candidate)) {
    candidate = `${slug}-${generateShortId().toLowerCase()}`;
  }
  return candidate;
}
