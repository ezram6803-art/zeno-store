// ==================== UTILS.JS ====================
// Shared utility functions for Zeno Store

async function getMe() {
  const res = await fetch('/api/me');
  const data = await res.json();
  return data.user;
}

async function checkAuth() {
  const user = await getMe();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
}

function hideLoading() {
  const el = document.getElementById('pageLoading');
  if (el) {
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 400);
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Auto hide loading after 2.5s fallback
setTimeout(() => hideLoading(), 2500);
