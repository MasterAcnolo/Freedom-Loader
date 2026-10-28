const {parseVideo, parsePlaylist} = require("../../server/helpers/parseInfo.helpers");

describe("parseInfo.helpers", () => {
    describe("parseVideo", () => {
        test("adds type video and spreads data", () => {
            const data = {title: "Test Video", duration: 120, id: "abc123"};
            const result = parseVideo(data);
            expect(result.type).toBe("video");
            expect(result.title).toBe("Test Video");
            expect(result.duration).toBe(120);
            expect(result.id).toBe("abc123");
        });
    });

    describe("parsePlaylist", () => {
        test("normalizes playlist with entries", () => {
            const data = {
                title: "My Playlist",
                uploader: "Test Channel",
                entries: [
                    {
                        id: "vid1",
                        title: "Video 1",
                        webpage_url: "https://example.com/watch?v=vid1",
                        duration: 60,
                        thumbnail: "thumb1.jpg",
                        uploader: "Uploader1",
                    },
                    {
                        id: "vid2",
                        title: "Video 2",
                        webpage_url: "https://example.com/watch?v=vid2",
                        duration: 90,
                        thumbnail: "thumb2.jpg",
                        uploader: "Uploader2",
                    },
                ],
            };
            const result = parsePlaylist(data);
            expect(result.type).toBe("playlist");
            expect(result.title).toBe("My Playlist");
            expect(result.channel).toBe("Test Channel");
            expect(result.count).toBe(2);
            expect(result.videos).toHaveLength(2);
            expect(result.videos[0]).toEqual({
                id: "vid1",
                title: "Video 1",
                url: "https://example.com/watch?v=vid1",
                duration: 60,
                thumbnail: "thumb1.jpg",
                uploader: "Uploader1",
            });
        });

        test("falls back to id when title missing", () => {
            const data = {
                id: "PL123",
                entries: [],
            };
            const result = parsePlaylist(data);
            expect(result.title).toBe("PL123");
            expect(result.count).toBe(0);
            expect(result.videos).toEqual([]);
        });
    });
});
