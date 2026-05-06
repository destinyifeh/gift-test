import { customAlphabet } from 'nanoid';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const generateCode = (length: number = 8): string => {
  const nanoid = customAlphabet(ALPHABET, length);
  return nanoid();
};

export const generateGiftCode = (prefix: string = 'GFT-', length: number = 8): string => {
  return `${prefix}${generateCode(length)}`;
};

export const generateId = (): string => {
  // Can use slightly different logic or just lowercased nanoid for ids
  return generateCode(10).toLowerCase();
};

/**
 * Generates a secure, random claim token using nanoid.
 * Uses a robust alphabet for high entropy.
 */
export const generateClaimToken = (length: number = 16): string => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};
