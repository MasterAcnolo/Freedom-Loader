import {marked} from "../assets/libs/marked.esm.js";
import DOMPurify from "../assets/libs/purify.es.mjs";


/** DOM elements used by the changelog modal. */
const UI = {
  overlay: document.getElementById("changelog-overlay"),
  list: document.getElementById("changelog-list"),
  closeBtn: document.getElementById("changelog-close"),
  openBtn: document.getElementById("changelog-btn")
};

/** Changelog payload loaded from the Electron main process. */
let changelogData = null;

/** List of patterns to filter out from release notes. */
const BLACKLIST_PATTERNS = [
  /Found a bug or issue\?/i,
  /Next Release/i
];

/**
 * Formats an ISO release date for the current locale.
 *
 * @param {string} dateString - Release date returned by GitHub
 * @returns {string} Localized date or an empty string
 */
function formatDate(dateString) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

/**
 * Removes blacklisted lines or sections from the markdown text.
 *
 * @param {string} markdown - Raw markdown text
 * @returns {string} Cleaned markdown text
 */
function cleanMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let skipping = false;

  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    const isMatch = BLACKLIST_PATTERNS.some((pattern) => pattern.test(line));

    if (isMatch) {
      skipping = true;
      return false;
    }

    if (skipping && trimmed === "") {
      skipping = false;
      return true;
    }

    return !skipping;
  });

  return filteredLines.join("\n");
}

/**
 * Parses block-level Markdown, sanitizes it, and appends it to the parent element.
 *
 * @param {HTMLElement} parent - Element receiving the parsed content
 * @param {string} markdown - Release body in Markdown format
 */
function parseBlock(parent, markdown) {
  const cleaned = cleanMarkdown(markdown);
  const rawHtml = marked.parse(cleaned);
  parent.innerHTML = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ["target"]
  });
}

/** Renders the empty state when no releases are available. */
function renderEmpty() {
  const emptyMessage = document.createElement("p");
  emptyMessage.className = "changelog-empty";
  emptyMessage.textContent = "No changelog available.";
  UI.list.appendChild(emptyMessage);
}

/**
 * Renders one release entry in the changelog list.
 *
 * @param {object} release - Release data from the backend
 */
function renderEntry(release) {
  const article = document.createElement("article");
  article.className = "changelog-entry";

  const heading = document.createElement("div");
  heading.className = "changelog-entry-heading";

  const title = document.createElement("h3");
  title.textContent = release.name;

  const metadata = document.createElement("span");
  metadata.textContent = [release.version, formatDate(release.date)]
      .filter(Boolean)
      .join(" · ");

  heading.append(title, metadata);

  const body = document.createElement("div");
  body.className = "changelog-body";
  parseBlock(body, release.body);

  article.append(heading, body);
  UI.list.appendChild(article);
}

/** Renders all releases, replacing the current modal contents. */
function renderReleases(releases) {
  UI.list.replaceChildren();
  if (!releases.length) {
    renderEmpty();
    return;
  }
  releases.forEach((release) => renderEntry(release));
}

/** Opens the changelog modal and moves focus to its close button. */
function openChangelog(releases) {
  renderReleases(releases);
  UI.overlay.hidden = false;
  UI.closeBtn?.focus();
}

/** Closes the modal and records the current version as seen. */
async function closeChangelog() {
  UI.overlay.hidden = true;
  await window.uiAPI.markChangelogSeen();
}

/** Loads changelog data and opens the modal when unread releases exist. */
async function loadChangelog() {
  const features = await window.featureAPI.getFeatures();

  try {
    changelogData = await window.uiAPI.getChangelog();

    if (!changelogData.error && changelogData.hasUnread && features.showChanglogsAfterUpdate === true) {
      openChangelog(changelogData.unreadReleases);
      window.loggerAPI.logInfo("Showing Changelog");
    }
  } catch (error) {
    console.error("Unable to load changelog:", error);
  }
}

/** Handles a click on the button that opens the changelog. */
async function handleOpenClick() {
  if (!changelogData || changelogData.error) {
    changelogData = await window.uiAPI.getChangelog();
  }

  if (changelogData.error) {
    window.showError("Unable to load changelog. Please check your network connection.");
    return;
  }

  openChangelog(changelogData.releases);
}

/** Closes the modal when the user clicks on the overlay background. */
function handleOverlayClick(event) {
  if (event.target === UI.overlay) closeChangelog();
}

/** Closes the modal when Escape is pressed. */
function handleKeydown(event) {
  if (event.key === "Escape" && !UI.overlay.hidden) closeChangelog();
}

/** Registers all changelog modal event listeners. */
function bindEvents() {
  UI.openBtn?.addEventListener("click", handleOpenClick);
  UI.closeBtn?.addEventListener("click", closeChangelog);
  UI.overlay?.addEventListener("click", handleOverlayClick);
  document.addEventListener("keydown", handleKeydown);
}

/** Initializes the changelog data flow and modal interactions. */
function init() {
  bindEvents();
  loadChangelog();
}

init();