/**
 * Modern Toast Notification System
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show({ title, message, type = 'success', duration = 3500 }) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      info: 'ℹ',
      warning: '⚠',
      error: '✕'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || '✓'}</div>
      <div class="toast-content">
        <div class="toast-title">${title || type.toUpperCase()}</div>
        <div class="toast-message">${message || ''}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }
  }

  dismiss(toast) {
    if (!toast || toast.classList.contains('hiding')) return;
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }

  success(title, message) {
    this.show({ title, message, type: 'success' });
  }

  info(title, message) {
    this.show({ title, message, type: 'info' });
  }

  warning(title, message) {
    this.show({ title, message, type: 'warning' });
  }

  error(title, message) {
    this.show({ title, message, type: 'error' });
  }
}

export const toast = new ToastManager();
