import { toast } from './ui.js';

const groupsEl = document.getElementById('groups');
const searchEl = document.getElementById('search');
const sortSel = document.getElementById('sortMode');

let allGroups = [];

async function loadBookmarks() {
  try {
    const res = await fetch('data/bookmarks.json', { cache: 'no-store' });
    const data = await res.json();
    allGroups = data.groups || [];
    render(allGroups, '', sortSel?.value || 'title');
    toast('Bookmarks loaded');
  } catch (e) {
    groupsEl.innerHTML = '<div class="text-sm text-red-300">Failed to load bookmarks.</div>';
  }
}
function domainFromUrl(u) { try { return new URL(u).hostname.replace(/^www\./,''); } catch { return ''; } }
function faviconFor(url) { const d=domainFromUrl(url); return d ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=64` : ''; }

function render(groups, query, sortKey) {
  const q = (query || '').toLowerCase().trim();
  groupsEl.innerHTML = '';
  for (const g of groups) {
    let links = (g.links || []).filter(l => !q || l.label?.toLowerCase().includes(q) || l.url?.toLowerCase().includes(q));
    if (!links.length) continue;
    links.sort((a,b) => sortKey==='domain' ? domainFromUrl(a.url).localeCompare(domainFromUrl(b.url)) : (a.label||'').localeCompare(b.label||''));
    const wrap = document.createElement('div'); wrap.className='card-wrap';
    const card = document.createElement('section'); card.className='card p-4'; card.innerHTML = `<h3 class="font-semibold mb-3">${g.title}</h3>`;
    const list = document.createElement('div'); list.className='grid gap-2';
    for (const link of links) {
      const a = document.createElement('a'); a.href=link.url; a.target='_blank'; a.rel='noopener'; a.className='row';
      const iconUrl = link.icon ? `assets/icons/${link.icon}` : faviconFor(link.url);
      const fallbackLetter = (link.label || '•').charAt(0).toUpperCase();
      a.innerHTML = `<div class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
        ${iconUrl ? `<img src="${iconUrl}" class="w-6 h-6" alt="" onerror="this.remove()">` : `<span class="text-sm">${fallbackLetter}</span>`}
        </div>
        <div class="min-w-0">
          <div class="text-sm font-medium truncate">${link.label}</div>
          <div class="text-[11px] text-slate-400 truncate">${domainFromUrl(link.url) || link.url}</div>
        </div>`;
      list.appendChild(a);
    }
    card.appendChild(list); wrap.appendChild(card); groupsEl.appendChild(wrap);
  }
}
searchEl?.addEventListener('input', (e) => render(allGroups, e.target.value, sortSel.value));
sortSel?.addEventListener('change', () => render(allGroups, searchEl?.value || '', sortSel.value));
loadBookmarks();
