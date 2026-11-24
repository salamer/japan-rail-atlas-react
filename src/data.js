import { nameFor, searchKey } from './locales.js';
import { bandOf, regions } from './rail-map.js';

export const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
export const CATEGORIES = ['all', 'highspeed', 'jr', 'metro', 'other'];

export const CATEGORY_DOT = {
  highspeed: 'bg-[#0051ff] dark:bg-[#4f94ff]',
  jr: 'bg-[#0f9d52] dark:bg-[#34d399]',
  metro: 'bg-[#8419f5] dark:bg-[#c084fc]',
  other: 'bg-[#eb4f14] dark:bg-[#fb923c]',
};

export const CATEGORY_BADGE = {
  highspeed: 'bg-[#e5eeff] text-[#003cc7] border-[#0051ff]/35 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-400/40',
  jr: 'bg-[#e3f7ec] text-[#086f38] border-[#0f9d52]/35 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-400/40',
  metro: 'bg-[#f2e8ff] text-[#630ec2] border-[#8419f5]/35 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-400/40',
  other: 'bg-[#ffece5] text-[#b53506] border-[#eb4f14]/35 dark:bg-orange-950/70 dark:text-orange-200 dark:border-orange-400/40',
};

export function kindOf(item) {
  return item.point ? 'station' : 'line';
}

export function isCensus(item) {
  return item.id.startsWith('c');
}

export function scopeOf(item, name) {
  if (!item.from || !item.to || item.from === item.to) return '';
  return name(item.from) + ' – ' + name(item.to);
}

export function measureOf(item) {
  if (kindOf(item) === 'station') return ['stationMetric', 'stationUnit'];
  return isCensus(item) ? ['censusMetric', 'dataPoints'] : ['routeMetric', 'routeUnit'];
}

function normalizeNote(text) {
  return (text || '').replace(/[、・\s]/g, '');
}

function hasScopeChangeNote(item) {
  const note = item.note || '';
  return /まで.*(輸送密度|合算|合計|含む)/.test(note) || /以前は.*輸送密度/.test(note);
}

export function readingFor(item, year) {
  if (isCensus(item)) {
    return { year: 2015, value: item.flow, yoy: null, vs2019: null, dailyPkm: null };
  }
  const index = year === 'latest' ? item.values.findLastIndex(value => value !== null) : YEARS.indexOf(Number(year));
  const resolvedYear = YEARS[index] ?? null;
  const value = index >= 0 ? (item.values[index] ?? null) : null;

  const isStn = kindOf(item) === 'station';
  const scopeChanged = isStn
    ? resolvedYear != null && normalizeNote(item.notes?.[String(resolvedYear)]) !== normalizeNote(item.notes?.['2019'])
    : hasScopeChangeNote(item);

  let yoy = null;
  if (value != null && index > 0) {
    const prevYear = YEARS[index - 1];
    const prev = item.values[index - 1];
    const crossedSplit = isStn
      ? normalizeNote(item.notes?.[String(resolvedYear)]) !== normalizeNote(item.notes?.[String(prevYear)])
      : (hasScopeChangeNote(item) && (resolvedYear === 2020 || resolvedYear === 2021 || resolvedYear === 2023));
    if (prev != null && prev > 0 && !crossedSplit) {
      yoy = ((value - prev) / prev) * 100;
    }
  }

  let vs2019 = null;
  const base2019 = item.values[1];
  if (value != null && index > 1 && base2019 != null && base2019 > 0 && !scopeChanged) {
    vs2019 = (value / base2019) * 100;
  }

  const dailyPkm = !item.point && item.km > 0 && value != null ? Math.round(value * item.km) : null;
  return { year: resolvedYear, value, yoy, vs2019, dailyPkm };
}

export function readingInView(item, view) {
  return readingFor(item, view.years[kindOf(item) === 'station' ? 'stations' : 'lines']);
}

export function compareReadings(a, b) {
  return (b.value ?? -1) - (a.value ?? -1);
}

export function sortRecords(records, sortKey = 'volume') {
  const copy = records.slice();
  if (sortKey === 'recovery') {
    copy.sort((a, b) => (b.vs2019 ?? -Infinity) - (a.vs2019 ?? -Infinity) || compareReadings(a, b));
  } else if (sortKey === 'yoy') {
    copy.sort((a, b) => (b.yoy ?? -Infinity) - (a.yoy ?? -Infinity) || compareReadings(a, b));
  } else {
    copy.sort(compareReadings);
  }
  return copy;
}

export function onePerGroup(records) {
  const seen = new Set();
  return records.filter(record => {
    if (seen.has(record.group)) return false;
    seen.add(record.group);
    return true;
  });
}

export function inRegion(item, region) {
  if (region === 'nation') return true;
  const [west, south, east, north] = regions[region].bounds;
  const [minX, minY, maxX, maxY] = item.bounds;
  if (maxX < west || minX > east || maxY < south || minY > north) return false;
  if (kindOf(item) === 'station') return true;
  return item.shape.some(path => path.some(([x, y]) => x >= west && x <= east && y >= south && y <= north));
}

function lineBounds(shape) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (const path of shape) {
    for (const [x, y] of path) {
      bounds[0] = Math.min(bounds[0], x);
      bounds[1] = Math.min(bounds[1], y);
      bounds[2] = Math.max(bounds[2], x);
      bounds[3] = Math.max(bounds[3], y);
    }
  }
  return bounds;
}

function indexedRecords(records, byId, groups) {
  return records.map(item => {
    const isStation = kindOf(item) === 'station';
    const group = isStation ? item.group || item.id : JSON.stringify([isCensus(item), item.operator, item.name]);
    const fields = [item.name, item.operator, item.from, item.to, item.line].filter(Boolean);
    const aliases = fields.flatMap(value => ['ja', 'zh', 'en'].map(locale => searchKey(nameFor(value, locale))));
    const record = {
      ...item,
      group,
      bounds: isStation ? [...item.point, ...item.point] : lineBounds(item.shape),
      keys: [...new Set(aliases)],
      nameKeys: ['ja', 'zh', 'en'].map(locale => searchKey(nameFor(item.name, locale))),
    };
    byId.set(record.id, record);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(record);
    return record;
  });
}

export async function loadAtlas(signal) {
  const load = async name => {
    const response = await fetch(import.meta.env.BASE_URL + 'data/' + name + '.json', { signal });
    if (!response.ok) throw new Error('Unable to load map data: ' + name + ' (' + response.status + ')');
    return response.json();
  };
  const [base, rawLines, rawStations, rawCensus] = await Promise.all(['map', 'lines', 'stations', 'census'].map(load));
  const byId = new Map();
  const groups = new Map();
  const lines = indexedRecords(rawLines, byId, groups);
  const stations = indexedRecords(rawStations, byId, groups);
  const census = indexedRecords(rawCensus, byId, groups);
  return { base, lines, stations, census, byId, groups };
}

export function withReadings(records, year) {
  return records.map(record => ({ ...record, ...readingFor(record, year) }));
}

export function lineCandidates(data, mode, category, operator = null) {
  let pool = mode === 'census' ? data.census : data.lines;
  if (category !== 'all') pool = pool.filter(record => record.type === category);
  if (operator) pool = pool.filter(record => record.operator === operator);
  return pool;
}

function matchScore(item, query) {
  if (item.nameKeys.includes(query)) return 4;
  if (item.nameKeys.some(key => key.startsWith(query))) return 3;
  if (item.keys.some(key => key.startsWith(query))) return 2;
  return item.keys.some(key => key.includes(query)) ? 1 : 0;
}

export function searchRecords(records, query) {
  const key = searchKey(query);
  if (!key) return [];
  const matches = [];
  for (const record of records) {
    const score = matchScore(record, key);
    if (score) matches.push({ record, score });
  }
  matches.sort((a, b) => b.score - a.score || compareReadings(a.record, b.record));
  return onePerGroup(matches.map(match => match.record));
}

export function regionalRanking(records, region, activeBand = null, sortKey = 'volume') {
  let filtered = records.filter(record => inRegion(record, region));
  if (activeBand !== null) {
    filtered = filtered.filter(record => bandOf(record.value) === activeBand);
  }
  return onePerGroup(sortRecords(filtered, sortKey));
}

export function summarizeRecords(records) {
  const valid = records.filter(r => r.value != null);
  if (!valid.length) return null;
  const values = valid.map(r => r.value).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 ? values[mid] : Math.round((values[mid - 1] + values[mid]) / 2);
  const recoveries = valid.map(r => r.vs2019).filter(v => v != null && isFinite(v)).sort((a, b) => a - b);
  const rMid = Math.floor(recoveries.length / 2);
  const medianRecovery = recoveries.length
    ? (recoveries.length % 2 ? recoveries[rMid] : (recoveries[rMid - 1] + recoveries[rMid]) / 2)
    : null;
  const bands = [0, 0, 0, 0, 0, 0, 0];
  for (const r of valid) {
    const b = bandOf(r.value);
    if (b >= 0 && b < 7) bands[b]++;
  }
  return {
    count: valid.length,
    median,
    medianRecovery,
    bands,
  };
}
