import { toast } from './ui.js';

const feedEl = document.getElementById('feed');
const lastRefreshedEl = document.getElementById('lastRefreshed');
const reloadBtn = document.getElementById('reloadBtn');
const densitySel = document.getElementById('density');
const viewModeSel = document.getElementById('viewMode');
const topicFilterSel = document.getElementById('topicFilter');
const starToggleBtn = document.getElementById('starToggle');

let STATE = {
  items: [],
  density: localStorage.getItem('density') || 'comfortable',
  view: localStorage.getItem('view') || 'cards',
  topic: localStorage.getItem('topic') || 'all',
  starredOnly: localStorage.getItem('starredOnly') === 'true'
};

function setGrid() {
  if (!feedEl) return;
  if (STATE.view === 'list') feedEl.className = 'grid gap-3';
  else feedEl.className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';
}
function savePrefs() {
  localStorage.setItem('density', STATE.density);
  localStorage.setItem('view', STATE.view);
  localStorage.setItem('topic', STATE.topic);
  localStorage.setItem('starredOnly', String(STATE.starredOnly));
}
function isStarred(id) {
  const s = JSON.parse(localStorage.getItem('starred') || '[]');
  return s.includes(id);
}
function toggleStar(id) {
  const s = new Set(JSON.parse(localStorage.getItem('starred') || '[]'));
  s.has(id) ? s.delete(id) : s.add(id);
  localStorage.setItem('starred', JSON.stringify([...s]));
}
function skeletons(n=9) {
  feedEl.innerHTML = '';
  for (let i=0;i<n;i++){ const d=document.createElement('div'); d.className='skeleton-card'; feedEl.appendChild(d); }
}
function topicColor(topic) {
  switch (topic) {
    case 'OSINT': return 'from-emerald-400 to-cyan-400';
    case 'News': return 'from-indigo-400 to-sky-400';
    default: return 'from-indigo-300 to-cyan-300';
  }
}

function render() {
  setGrid(); feedEl.innerHTML='';
  let items = [...STATE.items];
  if (STATE.topic !== 'all') items = items.filter(i => i.topic === STATE.topic);
  if (STATE.starredOnly) items = items.filter(i => isStarred(i.id));
  if (!items.length) { feedEl.innerHTML = `<div class="text-sm text-slate-300">No items match your filters.</div>`; return; }

  for (const item of items) {
    const t = item.title || 'Untitled';
    const time = item.published_at ? new Date(item.published_at).toLocaleString() : '—';
    if (STATE.view === 'list') {
      const row = document.createElement('a');
      row.href = item.url; row.target = '_blank'; row.rel='noopener'; row.className = 'row';
      row.innerHTML = `
        <div class="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
          ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : `<span class="text-sm">${(item.source||'•')[0]}</span>`}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2"><span class="badge">${item.source||'Source'}</span> ${item.topic?`<span class="badge">${item.topic}</span>`:''}</div>
          <div class="font-medium truncate">${t}</div>
          <div class="text-xs text-slate-400">${time}</div>
        </div>
        <button class="btn-subtle !px-2 !py-1 star ${isStarred(item.id) ? 'opacity-100':'opacity-40'}" data-id="${item.id}">★</button>`;
      feedEl.appendChild(row);
    } else {
      const wrap = document.createElement('div'); wrap.className='card-wrap hover:scale-[1.01] transition';
      const card = document.createElement('article'); card.className='card p-3';
      card.innerHTML = `
        ${item.image ? `<img src="${item.image}" alt="" class="w-full h-40 object-cover rounded-xl mb-3">` : ''}
        <div class="flex items-center justify-between gap-3 mb-1">
          <div class="flex items-center gap-2">
            <span class="badge">${item.source||'Source'}</span>
            ${item.topic?`<span class="badge">${item.topic}</span>`:''}
          </div>
          <div class="text-[11px] text-slate-400">${time}</div>
        </div>
        <h3 class="text-base font-semibold leading-snug">${t}</h3>
        <p class="mt-1 text-sm text-slate-300 line-clamp-3">${item.summary || ''}</p>
        <div class="mt-3 flex items-center gap-2">
          <a href="${item.url}" target="_blank" rel="noopener" class="btn-subtle">Open</a>
          <button class="btn-subtle star ${isStarred(item.id) ? 'opacity-100':'opacity-40'}" data-id="${item.id}">★</button>
        </div>`;
      wrap.appendChild(card); feedEl.appendChild(wrap);
    }
  }
  feedEl.querySelectorAll('.star').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const id=btn.getAttribute('data-id'); toggleStar(id); btn.classList.toggle('opacity-40'); btn.classList.toggle('opacity-100'); });
  });
}

async function loadFeed(showToast=true) {
  try {
    skeletons(STATE.view==='list'?6:9);
    const res = await fetch('data/feeds.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load feeds.json');
    const data = await res.json();
    STATE.items = data.items || [];
    lastRefreshedEl.textContent = `Last refreshed: ${new Date(data.generated_at).toLocaleString()}`;
    render(); if (showToast) toast('Feed updated');
  } catch (e) {
    console.error(e);
    lastRefreshedEl.textContent = 'Failed to load feed.';
    feedEl.innerHTML = `<div class="text-sm text-red-300">Could not load feed. Try again later.</div>`;
  }
}

reloadBtn?.addEventListener('click', () => loadFeed(true));
densitySel?.addEventListener('change', (e) => { STATE.density=e.target.value; savePrefs(); render(); });
viewModeSel?.addEventListener('change', (e) => { STATE.view=e.target.value; savePrefs(); render(); });
topicFilterSel?.addEventListener('change', (e) => { STATE.topic=e.target.value; savePrefs(); render(); });
starToggleBtn?.addEventListener('click', () => { STATE.starredOnly=!STATE.starredOnly; savePrefs(); render(); });

(function init(){
  if (densitySel) densitySel.value = STATE.density;
  if (viewModeSel) viewModeSel.value = STATE.view;
  if (topicFilterSel) topicFilterSel.value = STATE.topic;
  starToggleBtn?.classList.toggle('opacity-60', !STATE.starredOnly);
})();
loadFeed();
