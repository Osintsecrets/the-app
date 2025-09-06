import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true
});

async function readJSON(p) {
  const txt = await fs.readFile(p, 'utf8');
  return JSON.parse(txt);
}

function toISO(d) {
  try { return new Date(d).toISOString(); } catch { return null; }
}

function pickImage(item) {
  // Try common fields for RSS/Atom thumbnails
  if (item['media:thumbnail']?.['@_url']) return item['media:thumbnail']['@_url'];
  if (item['media:content']?.['@_url']) return item['media:content']['@_url'];
  if (item.enclosure?.['@_url']) return item.enclosure['@_url'];
  if (item.thumbnail?.url) return item.thumbnail.url;
  return null;
}

function normalizeItem(raw, source) {
  const title = raw.title?.['#text'] || raw.title || '';
  const link = raw.link?.href || raw.link || raw.guid?.['#text'] || '';
  const pub = raw.pubDate || raw.published || raw.updated || null;
  const summary = raw.description || raw.summary || raw['content:encoded'] || '';
  const image = pickImage(raw);
  return {
    id: `${(source.name || 'src')}-${Buffer.from((link || title)).toString('base64').slice(0,24)}`,
    source: source.name || 'Unknown',
    topic: source.topic || null,
    title: (typeof title === 'string') ? title : '',
    url: (typeof link === 'string') ? link : '',
    image: image || null,
    published_at: pub ? toISO(pub) : null,
    summary: (typeof summary === 'string') ? summary.replace(/<[^>]+>/g, '').slice(0, 300) : ''
  };
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

async function readFeed(urlObj) {
  const xml = await fetchText(urlObj.url);
  const j = parser.parse(xml);

  // Try Atom/RSS shapes
  const items =
    j?.rss?.channel?.item ||
    j?.feed?.entry ||
    [];

  return Array.isArray(items) ? items.map(i => normalizeItem(i, urlObj)) : [];
}

async function main() {
  const sources = await readJSON(path.join(dataDir, 'sources.json'));

  let all = [];
  for (const src of (sources.sources || [])) {
    if (src.type !== 'rss') continue; // extendable later
    try {
      const items = await readFeed(src);
      all.push(...items);
    } catch (e) {
      console.error(`Source failed: ${src.name} ->`, e.message);
    }
  }

  // Deduplicate by URL
  const dedup = new Map();
  for (const it of all) {
    const key = it.url || it.id;
    if (!dedup.has(key)) dedup.set(key, it);
  }
  const merged = [...dedup.values()]
    .sort((a, b) => (new Date(b.published_at||0)) - (new Date(a.published_at||0)))
    .slice(0, 300);

  const out = {
    generated_at: new Date().toISOString(),
    items: merged
  };

  await fs.writeFile(path.join(dataDir, 'feeds.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${merged.length} items to /data/feeds.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
