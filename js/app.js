const feedEl = document.getElementById('feed');
const lastRefreshedEl = document.getElementById('lastRefreshed');
const reloadBtn = document.getElementById('reloadBtn');

async function loadFeed() {
  try {
    const res = await fetch('data/feeds.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load feeds.json');
    const data = await res.json();
    lastRefreshedEl.textContent = `Last refreshed: ${new Date(data.generated_at).toLocaleString()}`;

    feedEl.innerHTML = '';
    const items = (data.items || []).slice(0, 60);
    for (const item of items) {
      const card = document.createElement('article');
      card.className = 'rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-900 transition';
      const date = item.published_at ? new Date(item.published_at).toLocaleString() : '—';
      const img = item.image ? `<img src="${item.image}" alt="" class="w-full h-40 object-cover rounded-xl mb-3"/>` : '';
      card.innerHTML = `
        ${img}
        <div class="flex items-center justify-between gap-4">
          <span class="text-xs text-slate-400">${item.source || 'Unknown'}</span>
          <span class="text-xs text-slate-500">${date}</span>
        </div>
        <h3 class="mt-1 text-base font-semibold">${item.title || 'Untitled'}</h3>
        <p class="mt-1 text-sm text-slate-300 line-clamp-3">${item.summary || ''}</p>
        <div class="mt-3 flex items-center gap-2">
          <a href="${item.url}" target="_blank" rel="noopener"
             class="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm">Open</a>
          ${item.topic ? `<span class="text-xs px-2 py-1 rounded bg-slate-800">${item.topic}</span>` : ''}
        </div>
      `;
      feedEl.appendChild(card);
    }
  } catch (e) {
    console.error(e);
    lastRefreshedEl.textContent = 'Failed to load feed.';
    feedEl.innerHTML = `<div class="text-sm text-red-300">Could not load feed. Try again later.</div>`;
  }
}

reloadBtn?.addEventListener('click', () => loadFeed());
loadFeed();
