const groupsEl = document.getElementById('groups');
const searchEl = document.getElementById('search');

let allGroups = [];

async function loadBookmarks() {
  try {
    const res = await fetch('data/bookmarks.json', { cache: 'no-store' });
    const data = await res.json();
    allGroups = data.groups || [];
    render(allGroups, '');
  } catch (e) {
    groupsEl.innerHTML = '<div class="text-sm text-red-300">Failed to load bookmarks.</div>';
  }
}

function render(groups, query) {
  const q = (query || '').toLowerCase().trim();
  groupsEl.innerHTML = '';
  for (const g of groups) {
    const filtered = (g.links || []).filter(
      l => !q || l.label.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)
    );
    if (!filtered.length) continue;

    const section = document.createElement('section');
    section.className = 'rounded-2xl border border-slate-800 bg-slate-900/60 p-4';
    section.innerHTML = `<h3 class="font-semibold mb-3">${g.title}</h3>`;

    const list = document.createElement('div');
    list.className = 'grid gap-2 sm:grid-cols-2';
    for (const link of filtered) {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'flex items-center gap-3 p-3 rounded-lg bg-slate-950/40 hover:bg-slate-800 transition';
      a.innerHTML = `
        ${link.icon ? `<img src="assets/icons/${link.icon}" class="w-6 h-6 rounded" alt=""/>` : ''}
        <div>
          <div class="text-sm font-medium">${link.label}</div>
          <div class="text-xs text-slate-400">${link.url}</div>
        </div>`;
      list.appendChild(a);
    }
    section.appendChild(list);
    groupsEl.appendChild(section);
  }
}

searchEl?.addEventListener('input', (e) => render(allGroups, e.target.value));
loadBookmarks();
