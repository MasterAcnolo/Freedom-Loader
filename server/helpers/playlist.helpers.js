/**
 * Determines whether a URL targets a playlist.
 *
 * The detection is based on the presence of the YouTube
 * playlist query parameter (`list`).
 *
 * @param {string} url - URL to inspect.
 * @returns {boolean} True if the URL appears to be a playlist.
 */
export function isUrlPlaylist(url) {
    return url.includes("?list=") || url.includes("&list=") || url.includes("@");
}