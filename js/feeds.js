import { toast } from './ui.js';

const feedEl = document.getElementById('feed');
const lastRefreshedEl = document.getElementById('lastRefreshed');
const tabs = Array.from(document.querySelectorAll('.tab'));
const searchEl = document.getElementById('search');
const timeSel = document.getElementById('timeWindow');
const layoutSel = document.getElementById('layoutMode');
const reloadBtn = document.getElementById('reloadBtn');
const sourcesList = document.getElementById('sourcesList');

let RAW = [];
let STATE = {
  topic: 'all',
  q: '',
  time: 'all',
  layout: localStorage.getItem('feeds_layout') || 'cards'
};

function withinWindow(dateIso, windowKey) {
  if (!dateIso || windowKey === 'all') return true;
  const d = new Date(dateIso).getTime();
  const now = Date.now();
  const days = windowKey === '24h' ? 1 : windowKey === '7d' ? 7 : 30;
  return (now - d) <= days * 24 * 60 * 60 * 1000;
}

function setGrid() {
  if (STATE.layout === 'list') {
    feedEl.className = 'grid gap-3';
  } else {
    feedEl.className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';
  }
}

function cardHtml(item) {
  const img = item.image ? `<img src="${item.image}" alt="" class="w-full h-40 object-cover rounded-xl mb-3">` : '';
  const t = item.title || 'Untitled';
  const time = item.published_at ? new Date(item.published_at).toLocaleString() : '—';
  return `
    <div class="card-wrap hover:scale-[1.01] transition">
      <article class="card p-3">
        ${img}
        <div class="flex items-center justify-between gap-3 mb-1">
          <div class="flex items-center gap-2">
            <span class="badge">${item.source || 'Source'}</span>
            ${item.topic ? `<span class="badge">${item.topic}</span>`:''}
          </div>
          <div class="text-[11px] text-slate-400">${time}</div>
        </div>
        <h3 class="text-base font-semibold leading-snug">${t}</h3>
        <p class="mt-1 text-sm text-slate-300 line-clamp-3">${item.summary || ''}</p>
        <div class="mt-3">
          <a href="${item.url}" target="_blank" rel="noopener" class="btn-subtle">Open</a>
        </div>
      </article>
    </div>
  `;
}

function rowHtml(item) {
  const t = item.title || 'Untitled';
  const time = item.published_at ? new Date(item.published_at).toLocaleString() : '—';
  return `
    <a href="${item.url}" target="_blank" rel="noopener" class="row">
      <div class="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
        ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : `<span class="text-sm">${(item.source||'•')[0]}</span>`}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="badge">${item.source || 'Source'}</span>
          ${item.topic ? `<span class="badge">${item.topic}</span>`:''}
        </div>
        <div class="font-medium truncate">${t}</div>
        <div class="text-xs text-slate-400">${time}</div>
      </div>
    </a>
  `;
}

function render() {
  setGrid();
  const q = STATE.q.toLowerCase().trim();
  let items = RAW.filter(it =>
    (STATE.topic === 'all' || it.topic === STATE.topic) &&
    withinWindow(it.published_at, STATE.time) &&
    (!q || (it.title||'').toLowerCase().includes(q) || (it.summary||'').toLowerCase().includes(q) || (it.source||'').toLowerCase().includes(q))
  );

  feedEl.innerHTML = '';
  if (!items.length) {
    feedEl.innerHTML = `<div class="text-sm text-slate-300">No items match your filters.</div>`;
    return;
  }
  if (STATE.layout === 'list') {
    for (const it of items) feedEl.insertAdjacentHTML('beforeend', rowHtml(it));
  } else {
    for (const it of items) feedEl.insertAdjacentHTML('beforeend', cardHtml(it));
  }
}

function skeletons(n=9) {
  feedEl.innerHTML = '';
  for (let i=0;i<n;i++) {
    const d = document.createElement('div');
    d.className = 'skeleton-card';
    feedEl.appendChild(d);
  }
}

async function loadFeed(showToast=true) {
  try {
    skeletons();
    const res = await fetch('data/feeds.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load feeds.json');
    const data = await res.json();
    RAW = data.items || [];
    lastRefreshedEl.textContent = `Last refreshed: ${new Date(data.generated_at).toLocaleString()}`;
    render();
    if (showToast) toast('Feed updated');
  } catch (e) {
    console.error(e);
    lastRefreshedEl.textContent = 'Failed to load feed.';
    feedEl.innerHTML = `<div class="text-sm text-red-300">Could not load feed. Try again later.</div>`;
  }
}

async function loadSources() {
  try {
    const res = await fetch('data/sources.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const byTopic = {};
    for (const s of (data.sources || [])) {
      const t = s.topic || 'Other';
      byTopic[t] = byTopic[t] || [];
      byTopic[t].push(s);
    }
    sourcesList.innerHTML = '';
    Object.keys(byTopic).sort().forEach(topic => {
      const wrap = document.createElement('div');
      wrap.className = 'rounded-2xl border border-white/10 bg-white/5 p-3';
      wrap.innerHTML = `<div class="font-semibold mb-2">${topic}</div>`;
      const ul = document.createElement('ul');
      ul.className = 'space-y-1 text-sm text-slate-300';
      byTopic[topic].forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="badge">${s.type || 'rss'}</span> <span class="ml-1">${s.name}</span>`;
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      sourcesList.appendChild(wrap);
    });
  } catch {}
}

// Events
tabs.forEach(b => b.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('bg-white/15'));
  b.classList.add('bg-white/15');
  STATE.topic = b.dataset.topic;
  localStorage.setItem('feeds_tab', STATE.topic);
  render();
}));
searchEl?.addEventListener('input', e => { STATE.q = e.target.value; render(); });
timeSel?.addEventListener('change', e => { STATE.time = e.target.value; render(); });
layoutSel?.addEventListener('change', e => { STATE.layout = e.target.value; localStorage.setItem('feeds_layout', STATE.layout); render(); });
reloadBtn?.addEventListener('click', () => loadFeed(true));

// Init
(() => {
  const savedTab = localStorage.getItem('feeds_tab') || 'all';
  const btn = tabs.find(t => t.dataset.topic === savedTab) || tabs[0];
  btn?.click();
  layoutSel.value = STATE.layout;
})();
loadFeed(false);
loadSources();
