/**
 * Google Review URL Builder Utility
 *
 * Replaces placeid in Google review URLs with actual googlePlaceId
 */

/**
 * Replaces 'xxx' placeholder with actual googlePlaceId in a Google review URL
 *
 * @param url - URL that may contain placeid=xxx
 * @param googlePlaceId - The actual Google Place ID
 * @returns URL with xxx replaced by googlePlaceId, or original URL if no replacement needed
 *
 * @example
 * replaceGooglePlaceId(
 *   "https://search.google.com/local/writereview?placeid=xxx",
 *   "ChIJN1t_tDeuEmsRUsoyG83frY4"
 * )
 * // Returns: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"
 */
export function replaceGooglePlaceId(
  url: string,
  googlePlaceId: string | null | undefined
): string {
  if (!googlePlaceId || !url) {
    return url;
  }

  // Replace 'xxx' in placeid parameter with actual googlePlaceId
  return url.replace(/placeid=xxx/i, `placeid=${googlePlaceId}`);
}
