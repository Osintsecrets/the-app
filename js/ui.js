// Shared UI behaviors: install prompt, menu overlay, theme toggle, toasts
let deferredPrompt = null;

// Install PWA
const installBtn = document.getElementById('installBtn');
const menuInstall = document.getElementById('menuInstall');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.disabled = false;
});
async function requestInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
}
installBtn?.addEventListener('click', requestInstall);
menuInstall?.addEventListener('click', requestInstall);

// Theme toggle (dark ↔ amoled)
const themeToggle = document.getElementById('themeToggle');
const menuTheme = document.getElementById('menuTheme');
function setTheme(mode) {
  if (mode === 'amoled') document.body.classList.add('amoled');
  else document.body.classList.remove('amoled');
  localStorage.setItem('theme', mode);
}
function toggleTheme() {
  const next = document.body.classList.contains('amoled') ? 'dark' : 'amoled';
  setTheme(next);
}
setTheme(localStorage.getItem('theme') || 'dark');
themeToggle?.addEventListener('click', toggleTheme);
menuTheme?.addEventListener('click', toggleTheme);

// Hamburger overlay
const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('menuOverlay');
const overlayPanel = overlay?.querySelector('.overlay-panel');
const menuClose = document.getElementById('menuClose');
function openMenu() {
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.dataset.open = 'true';
  requestAnimationFrame(() => { overlayPanel.style.opacity='1'; overlayPanel.style.transform='scale(1)'; });
}
function closeMenu() {
  if (!overlay) return;
  overlay.dataset.open = 'false';
  overlayPanel.style.opacity='0'; overlayPanel.style.transform='scale(0.95)';
  setTimeout(() => overlay.classList.add('hidden'), 180);
}
hamburger?.addEventListener('click', openMenu);
menuClose?.addEventListener('click', closeMenu);
overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });

// Toasts
export function toast(msg) {
  const host = document.getElementById('toastHost');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transform='translateY(6px)'; }, 1800);
  setTimeout(() => host.removeChild(el), 2200);
}
