// Clipboard paste functionality for URL input
document.addEventListener('DOMContentLoaded', () => {
    const pasteBtn = document.getElementById('pasteBtn');
    const urlInput = document.getElementById('UrlInput');

    if (pasteBtn && urlInput) {
        pasteBtn.addEventListener('click', async () => {
            try {
                // Read text from clipboard
                const text = await navigator.clipboard.readText();
                
                // Paste into the URL input
                urlInput.value = text;
                
                // Trigger input event to ensure any listeners are notified
                urlInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Optional: Focus the input
                urlInput.focus();
                
                // Visual feedback
                pasteBtn.style.backgroundColor = 'var(--form-button-bg-hover-color)';
                setTimeout(() => {
                    pasteBtn.style.backgroundColor = '';
                }, 200);
                
            } catch (err) {
                console.error('Failed to read clipboard:', err);
                
                // Fallback: prompt user if clipboard API fails
                alert('Unable to access clipboard. Please paste manually using Ctrl+V.');
            }
        });
    }
});
