/**
 * Generates a unique slug from a title string.
 * @param title The base title to slugify
 * @returns A slugified string with a random suffix
 */
export function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${randomSuffix}`;
}
