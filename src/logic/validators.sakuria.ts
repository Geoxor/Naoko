/**
 * Validate if a string is a valid HTTP URL
 * @param string the string to validate
 * @author Bluskript
 * @pure
 */
export function isValidHttpUrl(string: string) {
  try {
    var url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * Fixes tenor URLs
 * @param url parses a url
 * @author Geoxor
 * @pure
 */
export function resolveTenor(url: string): string {
  if (url.startsWith("https://tenor") && !url.endsWith(".gif")) {
    return url + ".gif";
  }
  return url;
}
