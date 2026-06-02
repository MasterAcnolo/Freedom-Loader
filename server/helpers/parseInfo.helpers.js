/**
 * Normalizes a video payload by attaching the resource type.
 *
 * @param {Object} data - Raw video metadata.
 * @returns {Object} Normalized video object.
 */
function parseVideo(data) {
  return {
    type: "video",
    ...data
  };
}

/**
 * Transforms a raw playlist payload into a normalized structure
 * containing playlist metadata and a simplified list of videos.
 *
 * @param {Object} data - Raw playlist metadata.
 * @returns {Object} Normalized playlist object.
 */
function parsePlaylist(data) {
  return {
    type: "playlist",
    title: data.title || data.id,
    channel: data.uploader,
    count: data.entries.length,
    videos: (data.entries || []).map(v => ({
      id: v.id,
      title: v.title,
      url: v.webpage_url,
      duration: v.duration,
      thumbnail: v.thumbnail,
      uploader: v.uploader
    }))
  };
}

module.exports = { parseVideo, parsePlaylist };