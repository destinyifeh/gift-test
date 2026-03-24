import {customAlphabet} from 'nanoid';

/**
 * Generates a unique slug from a title string.
 * @param title The base title to slugify
 * @returns A slugified string with a random suffix
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

// Standard URL-safe alphabet (omitting confusing characters like 0/O, 1/l/I optionally if preferred, but standard base62 is fine)
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7,
);

export function generateShortId(): string {
  return nanoid();
}
