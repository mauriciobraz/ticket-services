/**
 * Generates a random string of the specified length.
 * @param length Length of the string to be generated.
 * @returns A random string of the specified length.
 */
export function randomString(length: number) {
  const ALPHANUM =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let result = '';

  for (let i = 0; i < length; i++) {
    result += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }

  return result;
}
