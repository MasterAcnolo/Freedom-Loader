/**
 * Displays a toast notification in the global UI container.
 *
 * Toasts are automatically appended to `#toast-container`,
 * support multiple visual types, and can auto-dismiss after a delay.
 *
 * @param {string} message - Message displayed inside the toast
 * @param {"success"|"error"|"warning"|"info"} [type="info"] - Visual style of the toast
 * @param {number} [duration=4000] - Auto-dismiss delay in milliseconds (0 disables auto removal)
 * @returns {HTMLElement|null} The created toast element or null if container is missing
 */
window.showToast = function (message, type = "info", duration = 4000) {
  const container = document.getElementById("toast-container");
  if (!container) return null;

  const toast = document.createElement("div");
  toast.classList.add("toast", type);

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
  };

  const icon = icons[type] || icons.info;

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" title="Close">×</button>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => removeToast(toast));

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }

  return toast;
};

/**
 * Removes a toast element with a small exit animation.
 *
 * @param {HTMLElement} toast
 */
function removeToast(toast) {
  if (!toast?.parentElement) return;

  toast.classList.add("removing");

  setTimeout(() => {
    toast.remove();
  }, 300);
}

/**
 * Shortcut: success toast
 */
window.showSuccess = (message, duration = 4000) =>
  window.showToast(message, "success", duration);

/**
 * Shortcut: error toast
 */
window.showError = (message, duration = 5000) =>
  window.showToast(message, "error", duration);

/**
 * Shortcut: warning toast
 */
window.showWarning = (message, duration = 4000) =>
  window.showToast(message, "warning", duration);

/**
 * Shortcut: info toast
 */
window.showInfo = (message, duration = 4000) =>
  window.showToast(message, "info", duration);