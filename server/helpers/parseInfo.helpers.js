/**
 * Normalizes a video payload by attaching the resource type.
 *
 * @param {Object} data - Raw video metadata.
 * @returns {Object} Normalized video object.
 */
function parseVideo(data) {
  return {
    type: "video",

    id: data.id,
    title: data.title,
    fulltitle: data.fulltitle,

    webpage_url: data.webpage_url,
    thumbnail: data.thumbnail || data.thumbnails?.at(-1)?.url || null,

    duration: data.duration,

    channel: data.channel,
    channel_url: data.channel_url,

    uploader: data.uploader,
    uploader_id: data.uploader_id,
    uploader_url: data.uploader_url,

    extractor: data.extractor,
    filesize_approx: data.filesize_approx,

    is_live: data.is_live,
    upload_date: data.upload_date,

    view_count: data.view_count,
    like_count: data.like_count,
    categories: data.categories,
    tags: data.tags,

    // heatmap: data.heatmap,
  }
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