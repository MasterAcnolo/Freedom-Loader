window.showToast = function(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Create toast element
  const toast = document.createElement('div');
  toast.classList.add('toast', type);

  // Icons for different types
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const icon = icons[type] || icons.info;

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" title="Close">×</button>
  `;

  // Add close functionality
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  // Add to container
  container.appendChild(toast);

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }

  return toast;
};

function removeToast(toast) {
  if (!toast.parentElement) return;
  
  toast.classList.add('removing');
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 300);
}

window.showSuccess = (message, duration = 4000) => window.showToast(message, 'success', duration);
window.showError = (message, duration = 5000) => window.showToast(message, 'error', duration);
window.showWarning = (message, duration = 4000) => window.showToast(message, 'warning', duration);
window.showInfo = (message, duration = 4000) => window.showToast(message, 'info', duration);
