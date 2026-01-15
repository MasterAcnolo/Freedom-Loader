const path = require("path");

const getUserBrowser = require("./getBrowser");
const { ffmpegPath, denoPath} = require("./path");
const { configFeatures } = require("../../config.js");
const { logger } = require("../logger");

function validateCodec(codec){

  const validCodec = [
    "av01","vp9.2", "vp9" , "h265" , "h264" , "vp8" , "h263", "theora" 
  ]

  if(validCodec.includes(codec)){
      logger.info("Codec Valid:", codec)
      return codec
  } else{
    logger.error(`Codec not valid: ${codec}. Using default codec`)
    return "h264"
  }
}

function buildYtDlpArgs({ url, audioOnly, quality, outputFolder }) {
  
  const args = [
    configFeatures.verboseLogs ? "--verbose" : null, // Verbose Logs
    "--cookies-from-browser", `${getUserBrowser()}`,
    "--no-continue",
    "--no-overwrites",
    "--newline", // YT-DLP Logs Format 
    configFeatures.addThumbnail ? "--embed-thumbnail" : null,
    configFeatures.addMetadata ? "--add-metadata" : null,
    "--concurrent-fragments", "8",
    "--retries", "10",
    "--fragment-retries", "10",
    "--ffmpeg-location", ffmpegPath,
    "--extractor-args","youtube:player_client=default",
    "--js-runtimes", `deno:${denoPath}`,
    "-S", `vcodec:${validateCodec(configFeatures.customCodec) || "h264"}`,
    configFeatures.autoDownloadPlaylist ? "--yes-playlist" : "--no-playlist"
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

  return args.filter(Boolean);
}

module.exports = { buildYtDlpArgs };

