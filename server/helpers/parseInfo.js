function parseVideo(data) {

    return {
        type: "video",
        // id: data.id,
        // title: data.title,
        // url: data.webpage_url,
        // duration: data.duration,
        // thumbnail: data.thumbnail,
        // uploader: data.uploader
        ...data
    };
}

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
