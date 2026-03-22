import {customAlphabet} from 'nanoid';

// 1. Define a human-friendly alphabet (32 characters)
// Removed: 0, O, I, 1, L to avoid "Is that a zero or an O?" confusion
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a secure, readable gift code.
 * @param prefix - The string to prepend (e.g., 'GFT-')
 * @param length - The number of random characters to generate
 */
export function generateGiftCode(
  prefix: string = 'GFT-',
  length: number = 8,
): string {
  // 2. Create the custom generator
  const nanoid = customAlphabet(alphabet, length);

  // 3. Return the prefixed code
  return `${prefix}${nanoid()}`;
}
