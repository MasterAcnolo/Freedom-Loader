const path = require("path");

const getUserBrowser = require("./getBrowser");
const { ffmpegPath, denoPath} = require("./path");


function buildYtDlpArgs({ url, audioOnly, quality, outputFolder }) {
  
  const args = [
    "--cookies-from-browser", `${getUserBrowser()}`,
    "--no-continue",
    "--no-overwrites",
    "--embed-thumbnail",
    "--add-metadata",
    "--concurrent-fragments", "8",
    "--retries", "10",
    "--fragment-retries", "10",
    "--ffmpeg-location", ffmpegPath,
    "--extractor-args","youtube:player_client=default",
    "--js-runtimes", `deno:${denoPath}`,
    "-S", "vcodec:h264" // Will be replaced with a variables when i will add the settings panel (Next Update ?)
  ];

  if (audioOnly) args.push("-f", "bestaudio", "--extract-audio", "--audio-format", "mp3");
  else args.push("--merge-output", "mp4");

  const qualityMap = {
    best: "bestvideo+bestaudio/best/mp4",
    medium: "bestvideo[height<=720]+bestaudio/best[height<=720]/mp4",
    worst: "worstvideo+worstaudio/worst/mp4",
    1080: "bestvideo[height<=1080]+bestaudio/best[height<=1080]/mp4",
    720: "bestvideo[height<=720]+bestaudio/best[height<=720]/mp4",
    480: "bestvideo[height<=480]+bestaudio/best[height<=480]/mp4",
  };

  args.push("-f", qualityMap[quality] || "best");
  args.push("-o", path.join(outputFolder, "%(title)s.%(ext)s"));
  args.push(url);

  return args;
}

module.exports = { buildYtDlpArgs };

