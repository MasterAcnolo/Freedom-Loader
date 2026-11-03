const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const https = require("https");
const config = require("../config");
const { logger } = require("../server/logger");

/** Maximum age of the cached release list before it must be refreshed. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Filename used to persist changelog data in the Electron user data folder. */
const CACHE_FILE_NAME = "changelog-cache.json";

/** GitHub API endpoint containing the application's published releases. */
const RELEASES_URL = "https://api.github.com/repos/MasterAcnolo/Freedom-Loader/releases";

/** Returns the path of the local changelog cache file. */
function getCachePath() {
  return path.join(app.getPath("userData"), CACHE_FILE_NAME);
}

/**
 * Extracts the numeric major, minor, and patch parts from a version string.
 *
 * @param {string} version - Version string or release tag
 * @returns {number[]|null} Parsed version parts, or null when invalid
 */
function normalizeVersion(version) {
  const match = String(version || "").match(/(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

/**
 * Compares two semantic version strings.
 *
 * @param {string} left - First version to compare
 * @param {string} right - Second version to compare
 * @returns {number} Negative, zero, or positive comparison result
 */
function compareVersions(left, right) {
  const leftParts = normalizeVersion(left) || [0, 0, 0];
  const rightParts = normalizeVersion(right) || [0, 0, 0];

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] - rightParts[index];
    }
  }

  return 0;
}

/** Reads and parses the cached changelog, if one is available. */
function readCache() {
  try {
    return JSON.parse(fs.readFileSync(getCachePath(), "utf8"));
  } catch {
    return null;
  }
}

/** Persists the fetched releases together with their cache timestamp. */
function writeCache(releases) {
  try {
    fs.writeFileSync(
      getCachePath(),
      JSON.stringify({ cachedAt: Date.now(), releases }, null, 2),
      "utf8",
    );
  } catch (error) {
    logger.warn(`Unable to cache changelog: ${error.message}`);
  }
}

/**
 * Fetches published releases from GitHub and maps them to the UI data shape.
 *
 * @returns {Promise<object[]>} Published releases
 */
function fetchReleases() {
  return new Promise((resolve, reject) => {
    const request = https.get(
      RELEASES_URL,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Freedom-Loader",
        },
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          // Do not attempt to parse an error response as a release list.
          if (response.statusCode !== 200) {
            reject(new Error(`GitHub returned HTTP ${response.statusCode}`));
            return;
          }

          try {
            // Draft releases are not visible to users and should not appear in the changelog.
            const releases = JSON.parse(body)
              .filter((release) => !release.draft)
              .map((release) => ({
                version: release.tag_name,
                name: release.name || release.tag_name,
                date: release.published_at || release.created_at,
                body: release.body || "No changelog available.",
                url: release.html_url,
              }));
            resolve(releases);
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.setTimeout(10000, () => {
      request.destroy(new Error("Changelog request timed out"));
    });
    request.on("error", reject);
  });
}

/**
 * Returns cached or freshly fetched releases and identifies unread versions.
 *
 * @returns {Promise<object>} Changelog data for the renderer
 */
async function getChangelog() {
  const cache = readCache();
  let releases = cache?.releases || [];
  const cacheIsFresh = cache && cache.releases?.length > 0 && Date.now() - cache.cachedAt < CACHE_TTL_MS;

  // Refresh stale or missing data, while keeping the last cache as a fallback.
  if (!cacheIsFresh) {
    try {
      releases = await fetchReleases();
      writeCache(releases);
    } catch (error) {
      logger.warn(`Unable to retrieve changelog: ${error.message}`);
    }
  }

  const lastSeenVersion = cache?.lastSeenVersion || null;

  // Without a previous version, all available releases are considered unread.
  const unreadReleases = lastSeenVersion
    ? releases.filter((release) => compareVersions(release.version, lastSeenVersion) > 0)
    : releases;

  return {
    // An empty release list means that the fetch failed or returned no releases.
    error: releases.length === 0,
    currentVersion: config.version,
    lastSeenVersion,
    hasUnread: unreadReleases.length > 0,
    releases,
    unreadReleases,
  };
}

/** Marks the current application version as seen in the local cache. */
function markChangelogSeen() {
  const cache = readCache() || { releases: [] };
  cache.lastSeenVersion = config.version;
  cache.cachedAt = cache.cachedAt || 0  ;
  fs.mkdirSync(path.dirname(getCachePath()), { recursive: true });
  fs.writeFileSync(getCachePath(), JSON.stringify(cache, null, 2), "utf8");
  return true;
}

module.exports = { getChangelog, markChangelogSeen };
