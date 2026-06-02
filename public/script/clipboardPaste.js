/**
 * Initializes clipboard paste functionality for the URL input field.
 *
 * When the user clicks the paste button, the system attempts to read
 * the clipboard content and inject it into the URL input field.
 * It also triggers an input event to notify any bound listeners.
 */
document.addEventListener("DOMContentLoaded", () => {
  const pasteBtn = document.getElementById("pasteBtn");
  const urlInput = document.getElementById("UrlInput");

  if (!pasteBtn || !urlInput) return;

  /**
   * Handles clipboard paste action triggered by the paste button.
   * Reads clipboard text and inserts it into the URL input field.
   */
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();

      urlInput.value = text;

      // Notify frameworks / listeners bound to input changes
      urlInput.dispatchEvent(new Event("input", { bubbles: true }));

      urlInput.focus();

      // Temporary UI feedback on paste action
      pasteBtn.style.backgroundColor = "var(--form-button-bg-hover-color)";
      setTimeout(() => {
        pasteBtn.style.backgroundColor = "";
      }, 200);
    } catch (err) {
      console.error("Clipboard access failed:", err);

      alert(
        "Unable to access clipboard. Please paste manually using Ctrl+V."
      );
    }
  });
});