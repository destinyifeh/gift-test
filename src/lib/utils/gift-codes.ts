import {randomBytes} from 'crypto';

/**
 * Generates a random gift code with a prefix.
 * @param prefix The prefix for the code (default: 'GFT-')
 * @param length The number of random characters to append (default: 5)
 * @returns A random alphanumeric code
 */

export function generateGiftCode(
  prefix: string = 'GFT-',
  length: number = 8,
): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(length);

  let code = prefix;

  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}
