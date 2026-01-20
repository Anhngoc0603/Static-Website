// ==================== TOAST NOTIFICATION ====================

let toastTimeout;

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  
  if (toast) {
    // Clear previous timeout
    clearTimeout(toastTimeout);
    
    // Set message and show
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after duration
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}

function hideToast() {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.remove('show');
  }
}

// Success toast
function showSuccessToast(message) {
  showToast('✓ ' + message);
}

// Error toast
function showErrorToast(message) {
  showToast('✗ ' + message);
}

// Info toast
function showInfoToast(message) {
  showToast('ℹ ' + message);
}