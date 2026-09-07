/**
 * A URL slug from a name.
 *
 * Strips diacritics first: "Université de Montréal" has to reach
 * `universite-de-montreal`, not `universit-de-montral`.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
