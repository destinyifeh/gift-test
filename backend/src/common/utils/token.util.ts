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
