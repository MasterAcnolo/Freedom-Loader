/** DOM elements used by the changelog modal. */
const UI = {
  overlay: document.getElementById("changelog-overlay"),
  list: document.getElementById("changelog-list"),
  closeBtn: document.getElementById("changelog-close"),
  openBtn: document.getElementById("changelog-btn")
};

/** Changelog payload loaded from the Electron main process. */
let changelogData = null;

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
 * Parses inline Markdown and appends safe DOM nodes to a parent element.
 *
 * @param {HTMLElement} parent - Element receiving the parsed content
 * @param {string} value - Inline Markdown text
 */
function parseInline(parent, value) {
    const tokenPattern = /(\*\*|__)(.+?)\1|(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)|`([^`]+)`|~~([^~]+)~~|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenPattern.exec(value)) !== null) {
      if (match.index > lastIndex) {
        parent.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
      }

      const element = match[7]
          ? document.createElement("a")
          : document.createElement(match[1] ? "strong" : match[3] || match[4] ? "em" : match[5] ? "code" : "del");

      element.textContent = match[7] || match[2] || match[3] || match[4] || match[5] || match[6];

      if (match[7]) {
        element.href = match[8];
        element.target = "_blank";
        element.rel = "noopener noreferrer";
      }

      parent.appendChild(element);
      lastIndex = tokenPattern.lastIndex;
    }

    if (lastIndex < value.length) {
      parent.appendChild(document.createTextNode(value.slice(lastIndex)));
    }
}

/**
 * Parses block-level Markdown such as headings, lists, quotes and code blocks.
 *
 * @param {HTMLElement} parent - Element receiving the parsed content
 * @param {string} markdown - Release body in Markdown format
 */
function parseBlock(parent, markdown) {
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    let paragraph = [];
    let list = null;
    let codeBlock = null;

    const flushParagraph = () => {
      if (!paragraph.length) return;
      const element = document.createElement("p");
      paragraph.forEach((line, index) => {
        if (index) element.appendChild(document.createElement("br"));
        parseInline(element, line);
      });
      parent.appendChild(element);
      paragraph = [];
    };

    const closeList = () => {
      if (list) {
        parent.appendChild(list);
        list = null;
      }
    };

    lines.forEach((line) => {
      if (line.trim().startsWith("```")) {
        flushParagraph();
        closeList();
        if (codeBlock) {
          const code = document.createElement("code");
          code.textContent = codeBlock.join("\n");
          const pre = document.createElement("pre");
          pre.appendChild(code);
          parent.appendChild(pre);
          codeBlock = null;
        } else {
          codeBlock = [];
        }
        return;
      }

      if (codeBlock) {
        codeBlock.push(line);
        return;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      const unorderedItem = line.match(/^\s*[-*+]\s+(.+)$/);
      const orderedItem = line.match(/^\s*\d+[.]\s+(.+)$/);
      const quote = line.match(/^\s*>\s?(.*)$/);

      if (!line.trim()) {
        flushParagraph();
        closeList();
      } else if (heading) {
        flushParagraph();
        closeList();
        const element = document.createElement(`h${heading[1].length}`);
        parseInline(element, heading[2]);
        parent.appendChild(element);
      } else if (unorderedItem || orderedItem) {
        flushParagraph();
        const isOrdered = Boolean(orderedItem);
        if (!list || list.tagName.toLowerCase() !== (isOrdered ? "ol" : "ul")) {
          closeList();
          list = document.createElement(isOrdered ? "ol" : "ul");
        }
        const item = document.createElement("li");
        parseInline(item, (unorderedItem || orderedItem)[1]);
        list.appendChild(item);
      } else if (quote) {
        flushParagraph();
        closeList();
        const element = document.createElement("blockquote");
        parseInline(element, quote[1]);
        parent.appendChild(element);
      } else if (/^\s*([-*_])\s*\1\s*\1\s*$/.test(line)) {
        flushParagraph();
        closeList();
        parent.appendChild(document.createElement("hr"));
      } else {
        paragraph.push(line);
      }
    });

    flushParagraph();
    closeList();
    if (codeBlock) {
      const code = document.createElement("code");
      code.textContent = codeBlock.join("\n");
      const pre = document.createElement("pre");
      pre.appendChild(code);
      parent.appendChild(pre);
    }
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
  await window.electronAPI.markChangelogSeen();
}

/** Loads changelog data and opens the modal when unread releases exist. */
async function loadChangelog() {
  try {
    changelogData = await window.electronAPI.getChangelog();
    if (!changelogData.error && changelogData.hasUnread) {
      openChangelog(changelogData.unreadReleases);
    }
  } catch (error) {
    console.error("Unable to load changelog:", error);
  }
}

/** Handles a click on the button that opens the changelog. */
async function handleOpenClick() {
  if (!changelogData || changelogData.error) {
    changelogData = await window.electronAPI.getChangelog();
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