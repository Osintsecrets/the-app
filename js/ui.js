export function toast(message, timeout = 3000) {
  const host = document.getElementById('toastHost');
  if (!host) return;
  const div = document.createElement('div');
  div.className = 'px-3 py-2 rounded-lg bg-slate-800 text-sm';
  div.textContent = message;
  host.appendChild(div);
  setTimeout(() => div.remove(), timeout);
}

// Theme toggle
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toast(`Theme: ${next}`);
  });
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
}

// Install PWA prompt
let deferred;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferred = e;
  document.getElementById('installBtn')?.classList.remove('hidden');
});
const installBtn = document.getElementById('installBtn');
installBtn?.addEventListener('click', async () => {
  if (!deferred) return;
  deferred.prompt();
  await deferred.userChoice;
  deferred = null;
});

// Mobile menu overlay
const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('menuOverlay');
const closeBtn = document.getElementById('menuClose');
function closeMenu() {
  overlay?.classList.add('hidden');
  overlay?.setAttribute('data-open', 'false');
}
function openMenu() {
  overlay?.classList.remove('hidden');
  overlay?.setAttribute('data-open', 'true');
}
hamburger?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);
overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });
