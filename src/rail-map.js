const X_RATIO = .81;
const PI2 = 2 * Math.PI;
const MAX_ZOOM = 4500;
const MIN_ZOOM = 12;
const cityFont = '"Inter", "Noto Sans SC", "Noto Sans JP", "Noto Sans CJK SC", "PingFang SC", system-ui, sans-serif';

export const regions = {
  nation: { label: 'nationwide', bounds: [128.8, 30.4, 146, 45.65] },
  tokyo: { label: 'tokyo', bounds: [138.98, 35.13, 140.53, 36.07] },
  nagoya: { label: 'nagoya', bounds: [136.29, 34.89, 137.55, 35.56] },
  osaka: { label: 'osaka', bounds: [134.94, 34.34, 136.28, 35.30] },
  fukuoka: { label: 'fukuoka', bounds: [129.98, 33.29, 131.04, 34.04] },
  sapporo: { label: 'sapporo', bounds: [140.98, 42.77, 141.97, 43.45] },
  okinawa: { label: 'okinawa', bounds: [127.53, 26.10, 128.12, 26.55] },
};

const cities = [
  [139.767, 35.681, '东京', '東京', 'Tokyo', 1, 12, -11],
  [135.496, 34.702, '大阪', '大阪', 'Osaka', 1, 11, 12],
  [136.882, 35.171, '名古屋', '名古屋', 'Nagoya', 1, 4, 14],
  [130.422, 33.590, '福冈', '福岡', 'Fukuoka', 1, 9, -10],
  [141.350, 43.068, '札幌', '札幌', 'Sapporo', 1, 10, 1],
  [140.883, 38.260, '仙台', '仙台', 'Sendai', 1, 11, 1],
  [132.475, 34.398, '广岛', '広島', 'Hiroshima', 1, 2, 14],
  [127.679, 26.214, '那霸', '那覇', 'Naha', 1, 9, 2],
  [135.758, 34.985, '京都', '京都', 'Kyoto', 2, 4, -11],
  [135.193, 34.693, '神户', '神戸', 'Kobe', 2, -10, -10],
  [139.623, 35.466, '横滨', '横浜', 'Yokohama', 2, 12, 7],
  [140.110, 35.612, '千叶', '千葉', 'Chiba', 2, 8, -11],
  [138.389, 34.972, '静冈', '静岡', 'Shizuoka', 2, 5, 13],
  [139.061, 37.913, '新潟', '新潟', 'Niigata', 2, 8, -11],
  [136.648, 36.578, '金泽', '金沢', 'Kanazawa', 2, 5, -11],
  [140.740, 40.827, '青森', '青森', 'Aomori', 2, 4, 14],
  [140.726, 41.774, '函馆', '函館', 'Hakodate', 2, 8, -10],
  [134.048, 34.350, '高松', '高松', 'Takamatsu', 2, 5, 12],
  [133.918, 34.666, '冈山', '岡山', 'Okayama', 2, -8, -8],
  [130.689, 32.790, '熊本', '熊本', 'Kumamoto', 2, 11, 0],
  [130.542, 31.584, '鹿儿岛', '鹿児島', 'Kagoshima', 2, 9, 1],
  [129.874, 32.752, '长崎', '長崎', 'Nagasaki', 2, -7, 10],
  [133.543, 33.568, '高知', '高知', 'Kōchi', 3, 10, 3],
  [131.606, 33.234, '大分', '大分', 'Ōita', 3, 8, -9],
  [139.624, 36.344, '宇都宫', '宇都宮', 'Utsunomiya', 3, 9, 1],
  [141.137, 39.701, '盛冈', '盛岡', 'Morioka', 3, 10, 1],
  [140.123, 39.717, '秋田', '秋田', 'Akita', 3, -8, -8],
  [143.897, 42.991, '钏路', '釧路', 'Kushiro', 3, 10, 2],
  [142.358, 43.763, '旭川', '旭川', 'Asahikawa', 3, 8, -9],
  [137.213, 36.701, '富山', '富山', 'Toyama', 3, 9, 4],
  [133.646, 35.431, '米子', '米子', 'Yonago', 3, 9, -9],
  [134.223, 34.828, '姬路', '姫路', 'Himeji', 3, 5, -9],
  [135.827, 34.680, '奈良', '奈良', 'Nara', 3, 8, 2],
];

const water = [
  [134.1, 40.31, '日本海', '日本海', 'SEA OF JAPAN', 220],
  [142.65, 32.93, '太平洋', '太平洋', 'PACIFIC OCEAN', 220],
  [126.27, 30.72, '东海', '東シナ海', 'EAST CHINA SEA', 190],
  [143.31, 36.23, '太平洋', '太平洋', 'PACIFIC OCEAN', 950, 220],
  [140.04, 35.42, '东京湾', '東京湾', 'TOKYO BAY', 1800, 200],
  [135.16, 34.48, '大阪湾', '大阪湾', 'OSAKA BAY', 1800, 200],
];

const otherPlaces = [
  [128.35, 36.34, '韩国', '韓国', 'SOUTH KOREA'],
  [145.3, 46.48, '俄罗斯', 'ロシア', 'RUSSIA'],
];

// 7-Tier High-Distinction Spectral Transit Scale:
// Cerulean Blue -> Viridian Cyan -> Botanical Emerald -> Golden Marigold -> Signal Vermilion -> Carmine Red -> Electric Violet
const FLOW_PALETTES = {
  light: ['#2f73b8', '#089992', '#1ea345', '#e69500', '#f4511e', '#d81b52', '#7414e6'],
  dark: ['#5da4eb', '#2dd4bf', '#4ade80', '#facc15', '#fb7139', '#f43f5e', '#c084fc'],
};

export const TYPE_PALETTES = {
  light: {
    highspeed: '#0051ff',
    jr: '#0f9d52',
    metro: '#8419f5',
    other: '#eb4f14',
  },
  dark: {
    highspeed: '#4f94ff',
    jr: '#34d399',
    metro: '#c084fc',
    other: '#fb923c',
  },
};

const MAP_THEMES = {
  light: {
    ocean: '#d4e4ec',
    grid: 'rgba(82, 108, 126, 0.24)',
    landJapan: '#fcfaf4',
    landForeign: '#ebe7dc',
    coast: '#6e8291',
    urban: '#efeae0',
    prefecture: '#d5d0c3',
    lakeFill: '#bdd8e6',
    lakeStroke: '#83a8bd',
    railBase: 'rgba(90, 102, 114, 0.42)',
    casingFar: 'rgba(24, 26, 30, 0.22)',
    casingNear: 'rgba(252, 250, 244, 0.88)',
    halo: 'rgba(252, 250, 244, 0.94)',
    waterText: '#537385',
    foreignText: '#767a75',
    cityMajorDot: '#18191b',
    cityMinorDot: '#525860',
    cityDotStroke: '#fcfaf4',
    cityMajorText: '#141517',
    cityMinorText: '#3f454d',
    stationLabel: '#272a30',
    stationPinFill: '#fffef9',
    stationPinStroke: '#18191b',
    stationStroke: '#18191b',
    selectOuter: '#fffef9',
    selectCasing: '#18191b',
    selectCore: '#ffd25a',
    hoverHalo: 'rgba(24, 25, 27, 0.24)',
    siblingCasing: 'rgba(24, 25, 27, 0.42)',
  },
  dark: {
    ocean: '#0c0f15',
    grid: 'rgba(90, 108, 138, 0.20)',
    landJapan: '#161a23',
    landForeign: '#10141c',
    coast: '#333c4f',
    urban: '#1f2533',
    prefecture: '#273042',
    lakeFill: '#0e1826',
    lakeStroke: '#2b4260',
    railBase: 'rgba(110, 126, 152, 0.34)',
    casingFar: 'rgba(10, 12, 17, 0.55)',
    casingNear: 'rgba(14, 17, 24, 0.88)',
    halo: 'rgba(18, 22, 30, 0.94)',
    waterText: '#4f6582',
    foreignText: '#5b677a',
    cityMajorDot: '#f8fafc',
    cityMinorDot: '#94a3b8',
    cityDotStroke: '#111317',
    cityMajorText: '#f8fafc',
    cityMinorText: '#94a3b8',
    stationLabel: '#e2e8f0',
    stationPinFill: '#18191b',
    stationPinStroke: '#cbd5e1',
    stationStroke: 'rgba(12, 15, 21, 0.9)',
    selectOuter: 'rgba(250, 204, 21, 0.38)',
    selectCasing: '#ffffff',
    selectCore: '#facc15',
    hoverHalo: 'rgba(250, 204, 21, 0.35)',
    siblingCasing: 'rgba(250, 204, 21, 0.36)',
  },
};

export const limits = [1000, 3000, 10000, 30000, 100000, 300000];

export function bandOf(value) {
  if (value == null) return -1;
  const found = limits.findIndex(limit => value < limit);
  return found < 0 ? limits.length : found;
}

export function flowColor(value, theme = 'light') {
  const palette = FLOW_PALETTES[theme] || FLOW_PALETTES.light;
  const idx = bandOf(value);
  return idx < 0 ? (theme === 'dark' ? '#475569' : '#94a3b8') : palette[idx];
}

export function typeColor(type, theme = 'light') {
  const palette = TYPE_PALETTES[theme] || TYPE_PALETTES.light;
  return palette[type] || palette.other;
}

// Recognizable line colors for corridors that overlap in the big cities.
// Key is operator|name. Shinkansen are shared across JR companies.
const LINE_COLORS = {
  'shinkansen|北海道新幹線': '#5b3fd6',
  'shinkansen|東北新幹線': '#1f9d55',
  'shinkansen|上越新幹線': '#c2185b',
  'shinkansen|北陸新幹線': '#7a1fa2',
  'shinkansen|東海道新幹線': '#123a9a',
  'shinkansen|山陽新幹線': '#0e6bb8',
  'shinkansen|九州新幹線': '#e4572e',
  'shinkansen|西九州新幹線': '#d97706',
  '東日本旅客鉄道|山手線': '#6fa314',
  '東日本旅客鉄道|中央線': '#e23b2a',
  '東日本旅客鉄道|総武線': '#1f6feb',
  '東日本旅客鉄道|東海道線': '#e39b08',
  '東日本旅客鉄道|東北線': '#c45c26',
  '東日本旅客鉄道|赤羽線': '#0e9f8e',
  '東日本旅客鉄道|常磐線': '#148f4e',
  '東日本旅客鉄道|京葉線': '#c01048',
  '東日本旅客鉄道|南武線': '#d4a017',
  '東日本旅客鉄道|横浜線': '#8fbf3a',
  '東日本旅客鉄道|横須賀線': '#0b4fa8',
  '東日本旅客鉄道|根岸線': '#1493c7',
  '東日本旅客鉄道|武蔵野線': '#7a4ea3',
  '東日本旅客鉄道|高崎線': '#e07a3d',
  '東日本旅客鉄道|青梅線': '#f07a4a',
  '東日本旅客鉄道|外房線': '#5b7fe0',
  '東日本旅客鉄道|川越線': '#a3c416',
  '東海旅客鉄道|東海道線': '#f0b429',
  '東海旅客鉄道|中央線': '#d9482b',
  '西日本旅客鉄道|大阪環状線': '#e10600',
  '西日本旅客鉄道|東海道線': '#f2b544',
  '西日本旅客鉄道|山陽線': '#1d6fbf',
  '西日本旅客鉄道|阪和線': '#0f8f6a',
  '西日本旅客鉄道|JR東西線': '#149aa8',
  '東京地下鉄|3号線銀座線': '#f08a00',
  '東京地下鉄|4号線丸ノ内線': '#f62e36',
  '東京地下鉄|2号線日比谷線': '#6e6e68',
  '東京地下鉄|5号線東西線': '#009bbf',
  '東京地下鉄|9号線千代田線': '#00a36a',
  '東京地下鉄|8号線有楽町線': '#b8963e',
  '東京地下鉄|11号線半蔵門線': '#7a5bd6',
  '東京地下鉄|7号線南北線': '#00a99d',
  '東京地下鉄|13号線副都心線': '#8c4a24',
  '東京都|1号線浅草線': '#e23b8c',
  '東京都|6号線三田線': '#1a6fdb',
  '東京都|10号線新宿線': '#4ea33a',
  '東京都|12号線大江戸線': '#b0006e',
  '東急電鉄|東横線': '#d0123a',
  '東急電鉄|田園都市線': '#128a62',
  '東急電鉄|大井町線': '#e56a12',
  '東急電鉄|目黒線': '#0b6e9a',
  '東急電鉄|東急新横浜線': '#0e8ec4',
  '小田急電鉄|小田原線・江ノ島線': '#2457c8',
  '京浜急行電鉄|本線': '#c40018',
  '京浜急行電鉄|空港線': '#ff5a4d',
  '京王電鉄|京王線・高尾線・相模原線': '#e21878',
  '京王電鉄|井の頭線': '#3d2ebf',
  '京成電鉄|本線': '#0a2f8f',
  '京成電鉄|押上線': '#4c6ef5',
  '東武鉄道|東上本線': '#0e4c9a',
  '東武鉄道|伊勢崎線': '#e88704',
  '西武鉄道|新宿線・拝島線': '#2f6bff',
  '西武鉄道|池袋線・西武秩父線': '#c99208',
  '相模鉄道|本線・いずみ野線': '#1f4e79',
  '横浜高速鉄道|みなとみらい21線': '#123e9c',
  '首都圏新都市鉄道|常磐新線': '#6b2c91',
  '東京臨海高速鉄道|りんかい線': '#1c8cba',
  '阪急電鉄|京都線・千里線・嵐山線': '#8c1d40',
  '阪急電鉄|神戸線・宝塚線・伊丹線': '#5c2a4a',
  '阪神電気鉄道|本線・阪神なんば線': '#e2b007',
  '京阪電気鉄道|京阪本線・鴨東線・中之島線': '#0e8a4a',
  '南海電気鉄道|南海本線': '#0088b8',
  '南海電気鉄道|高野線': '#0a6e8a',
  '北大阪急行電鉄|南北線': '#1a8f4a',
  '大阪市高速電気軌道|1号線(御堂筋線)': '#e10600',
  '大阪市高速電気軌道|6号線(堺筋線)': '#a6843a',
  '大阪市高速電気軌道|2号線(谷町線)': '#6c2c91',
  '大阪市高速電気軌道|4号線(中央線)': '#00a040',
  '大阪市高速電気軌道|3号線(四つ橋線)': '#0072c6',
  '名古屋市|東山線': '#e0a800',
  '名古屋市|鶴舞線': '#1a8fd0',
  '名古屋鉄道|名古屋本線': '#d00020',
  '京都市|烏丸線': '#00a651',
  '京都市|東西線': '#e06a00',
  '札幌市|南北線': '#1a8f4a',
  '札幌市|東西線': '#e07a14',
  '福岡市|空港線・箱崎線・七隈線': '#e06a2c',
};

function hashKey(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const lit = l / 100;
  const a = sat * Math.min(lit, 1 - lit);
  const channel = n => {
    const k = (n + h / 30) % 12;
    const c = lit - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return '#' + channel(0) + channel(8) + channel(4);
}

function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lit = (max + min) / 2;
  if (max === min) return [0, 0, lit * 100];
  const d = max - min;
  const sat = lit > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, sat * 100, lit * 100];
}

function colorForTheme(hex, theme) {
  if (theme !== 'dark') return hex;
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, Math.min(90, s + 8), Math.max(66, Math.min(76, l + 26)));
}

export function lineKey(item) {
  const name = item?.point ? (item.line || item.name) : item?.name;
  if (typeof name === 'string' && name.includes('新幹線')) return 'shinkansen|' + name;
  return (item?.operator || '') + '|' + (name || '');
}

export function lineColor(item, theme = 'light') {
  const key = lineKey(item);
  const pinned = LINE_COLORS[key];
  if (pinned) return colorForTheme(pinned, theme);
  const h = hashKey(key || 'line');
  const hue = Math.round((h % 997) * 137.508) % 360;
  const sat = 64 + (h % 16);
  const lit = theme === 'dark' ? 66 + (h % 9) : 36 + (h % 10);
  return hslToHex(hue, sat, lit);
}

export function itemColor(item, theme = 'light', colorMode = 'line') {
  if (!item) return flowColor(null, theme);
  if (item.point || colorMode === 'flow') return flowColor(item.value, theme);
  if (colorMode === 'type' && item.type) return typeColor(item.type, theme);
  return lineColor(item, theme);
}

export function flowWidth(value) {
  if (value == null) return 0.7;
  return 0.55 + 6.35 * Math.sqrt(value / (value + 90000));
}

export function stationSize(value) {
  return Math.min(19.5, 2.2 + 14.8 * Math.sqrt(value / (value + 195000)));
}

const project = ([lon, lat]) => [(lon - 135) * X_RATIO, 35 - lat];

function screen([x, y], view) {
  return [view.x + x * view.scale, view.y + y * view.scale];
}

function boundsOf(parts) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (const part of parts) {
    for (const [x, y] of part) {
      bounds[0] = Math.min(bounds[0], x);
      bounds[1] = Math.min(bounds[1], y);
      bounds[2] = Math.max(bounds[2], x);
      bounds[3] = Math.max(bounds[3], y);
    }
  }
  return bounds;
}

function vectorPath(coordinates, close = false) {
  const parts = coordinates.map(line => line.map(project));
  const path = new Path2D();
  for (const part of parts) {
    if (!part.length) continue;
    path.moveTo(...part[0]);
    for (let i = 1; i < part.length; i++) path.lineTo(...part[i]);
    if (close) path.closePath();
  }
  return { path, parts, bounds: boundsOf(parts) };
}

function distanceSquared(x, y, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const fraction = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return (x - a[0] - fraction * dx) ** 2 + (y - a[1] - fraction * dy) ** 2;
}

function touches(item, box, padding = 0) {
  return item[0] <= box[2] + padding && item[2] >= box[0] - padding
    && item[1] <= box[3] + padding && item[3] >= box[1] - padding;
}

function fit(bounds, width, height, edge = 58) {
  const left = width < 600 ? 23 : edge;
  const right = left;
  const top = Math.min(edge + 18, height * .20);
  const bottom = Math.min(edge + 4, height * .16);
  const [west, south, east, north] = bounds;
  const a = project([west, north]);
  const b = project([east, south]);
  const scale = Math.min(MAX_ZOOM, (width - left - right) / (b[0] - a[0] || .02), (height - top - bottom) / (b[1] - a[1] || .02));
  return { scale: Math.max(MIN_ZOOM, scale), x: (width + left - right) / 2 - (a[0] + b[0]) * scale / 2, y: (height + top - bottom) / 2 - (a[1] + b[1]) * scale / 2 };
}

function clampView(view, width, height) {
  const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.scale));
  const [minX, minY] = project([117, 49]);
  const [maxX, maxY] = project([155, 22]);
  const x = Math.max(width / 2 - maxX * scale, Math.min(width / 2 - minX * scale, view.x));
  const y = Math.max(height / 2 - maxY * scale, Math.min(height / 2 - minY * scale, view.y));
  return { x, y, scale };
}

function text(ctx, label, x, y, { size = 12, color = '#18191b', weight = 600, align = 'center', halo = '#fcfaf4' } = {}) {
  ctx.font = weight + ' ' + size + 'px ' + cityFont;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (halo) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = halo;
    ctx.strokeText(label, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(label, x, y);
}

export class RailMap {
  constructor(canvas, initial, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.callbacks = callbacks;
    this.land = initial.land.map(([japan, path]) => ({ japan, ...vectorPath([path], true) }));
    this.urban = initial.urban.map(path => vectorPath([path], true));
    this.lakes = initial.lakes.map(path => vectorPath([path], true));
    this.prefectures = initial.prefectures.map(path => vectorPath([path]));
    this.geometry = new Map();
    this.width = 1;
    this.height = 1;
    this.view = null;
    this.scene = {
      theme: 'light', colorMode: 'line', layer: 'lines', language: 'zh',
      tracks: [], stations: [], stationsForLabels: [],
      selection: null, hoveredItem: null, siblingIds: null, activeBand: null,
    };
    this.frame = 0;
    this.animation = 0;
    this.drag = null;
    this.pointers = new Map();
    this.pinch = null;
    this.dpr = 1;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.input = new AbortController();
    this.bindInput();
    this.watcher = new ResizeObserver(() => this.resize());
    this.watcher.observe(canvas);
    this.resize();
  }

  destroy() {
    this.input.abort();
    this.watcher.disconnect();
    this.cancelAnimation();
    if (this.frame) cancelAnimationFrame(this.frame);
    this.canvas.classList.remove('dragging', 'over-item');
  }

  palette() {
    return MAP_THEMES[this.scene.theme] || MAP_THEMES.light;
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (width === this.width && height === this.height && dpr === this.dpr && this.view) return;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    if (this.view) {
      this.view.x += (width - this.width) / 2;
      this.view.y += (height - this.height) / 2;
    } else {
      this.view = fit(regions.nation.bounds, width, height);
    }
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.requestDraw();
  }

  ensureLineGeometry(item) {
    if (item && !item.point && item.shape && !this.geometry.has(item.id)) {
      this.geometry.set(item.id, vectorPath(item.shape));
    }
  }

  setScene(scene) {
    for (const track of scene.tracks) this.ensureLineGeometry(track);
    if (scene.selection?.kind === 'line') this.ensureLineGeometry(scene.selection.item);
    if (scene.hoveredItem && !scene.hoveredItem.point) this.ensureLineGeometry(scene.hoveredItem);
    this.scene = scene;
    this.requestDraw();
  }

  fitTo(bounds, instant = false) {
    this.moveTo(fit(bounds, this.width, this.height), instant);
  }

  locateTrack(item) {
    const { bounds } = this.geometry.get(item.id) || vectorPath(item.shape);
    const lon = bounds[0] / X_RATIO + 135;
    const right = bounds[2] / X_RATIO + 135;
    const south = 35 - bounds[3];
    const north = 35 - bounds[1];
    const pad = Math.max(.012, Math.max(right - lon, north - south) * .12);
    this.fitTo([lon - pad, south - pad, right + pad, north + pad]);
  }

  locateStation(item) {
    const [lon, lat] = item.point;
    this.fitTo([lon - .088, lat - .058, lon + .088, lat + .058]);
  }

  moveTo(next, instant = false) {
    this.cancelAnimation();
    this.callbacks.hover(null);
    const target = clampView(next, this.width, this.height);
    if (instant || this.reduceMotion.matches) {
      this.view = target;
      this.requestDraw();
      return;
    }
    const from = this.view;
    const start = performance.now();
    const fromX = (this.width / 2 - from.x) / from.scale;
    const fromY = (this.height / 2 - from.y) / from.scale;
    const targetX = (this.width / 2 - target.x) / target.scale;
    const targetY = (this.height / 2 - target.y) / target.scale;
    const duration = 340;
    const step = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3.5;
      const scale = from.scale * (target.scale / from.scale) ** eased;
      this.view = {
        scale,
        x: this.width / 2 - (fromX + (targetX - fromX) * eased) * scale,
        y: this.height / 2 - (fromY + (targetY - fromY) * eased) * scale,
      };
      this.draw();
      this.animation = t < 1 ? requestAnimationFrame(step) : 0;
    };
    this.animation = requestAnimationFrame(step);
  }

  cancelAnimation() {
    if (this.animation) cancelAnimationFrame(this.animation);
    this.animation = 0;
  }

  zoom(factor, x = this.width / 2, y = this.height / 2) {
    this.cancelAnimation();
    const current = this.view;
    if (!current) return;
    const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current.scale * factor));
    const ratio = scale / current.scale;
    this.view = clampView({ scale, x: x - (x - current.x) * ratio, y: y - (y - current.y) * ratio }, this.width, this.height);
    this.callbacks.hover(null);
    this.requestDraw();
  }

  pan(dx, dy) {
    this.cancelAnimation();
    this.view = clampView({ ...this.view, x: this.view.x + dx, y: this.view.y + dy }, this.width, this.height);
    this.callbacks.hover(null);
    this.requestDraw();
  }

  requestDraw() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.draw();
    });
  }

  drawGrid(ctx, view, visible, pal) {
    const separation = view.scale > 1000 ? .1 : view.scale > 320 ? .5 : view.scale > 110 ? 1 : 5;
    const dx = separation * X_RATIO;
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = .72 / view.scale;
    ctx.setLineDash([1.6 / view.scale, 4.4 / view.scale]);
    ctx.beginPath();
    for (let x = Math.ceil(visible[0] / dx) * dx; x < visible[2]; x += dx) {
      ctx.moveTo(x, visible[1]);
      ctx.lineTo(x, visible[3]);
    }
    for (let y = Math.ceil(visible[1] / separation) * separation; y < visible[3]; y += separation) {
      ctx.moveTo(visible[0], y);
      ctx.lineTo(visible[2], y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawBase(ctx, view, visible, pal) {
    this.drawGrid(ctx, view, visible, pal);
    ctx.lineWidth = .95 / view.scale;
    ctx.strokeStyle = pal.coast;
    for (const piece of this.land) {
      if (!touches(piece.bounds, visible)) continue;
      ctx.fillStyle = piece.japan ? pal.landJapan : pal.landForeign;
      ctx.fill(piece.path);
      ctx.stroke(piece.path);
    }
    ctx.fillStyle = pal.urban;
    if (view.scale > 34) {
      for (const piece of this.urban) {
        if (touches(piece.bounds, visible)) ctx.fill(piece.path);
      }
    }
    ctx.strokeStyle = pal.prefecture;
    ctx.lineWidth = .7 / view.scale;
    for (const piece of this.prefectures) {
      if (touches(piece.bounds, visible)) ctx.stroke(piece.path);
    }
    ctx.fillStyle = pal.lakeFill;
    ctx.strokeStyle = pal.lakeStroke;
    for (const piece of this.lakes) {
      if (!touches(piece.bounds, visible)) continue;
      ctx.fill(piece.path);
      ctx.stroke(piece.path);
    }
  }

  drawLines(ctx, view, visible, pal) {
    const zoomWeight = Math.max(.86, Math.min(1.82, 1 + Math.log(Math.max(16, view.scale) / 65) * .17));
    const { selection: selected, hoveredItem, siblingIds, activeBand, theme, colorMode = 'line', layer } = this.scene;
    const isStations = layer === 'stations';
    const isDark = theme === 'dark';

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Night Mode subtle glow pass on major corridors
    if (!isStations && isDark) {
      ctx.globalAlpha = 0.22;
      for (const item of this.scene.tracks) {
        const tier = bandOf(item.value);
        if (tier < 4) continue;
        if (activeBand !== null && tier !== activeBand) continue;
        const line = this.geometry.get(item.id);
        if (!line || !touches(line.bounds, visible, .04)) continue;
        ctx.strokeStyle = itemColor(item, theme, colorMode);
        ctx.lineWidth = (flowWidth(item.value) * zoomWeight * 2.4) / view.scale;
        ctx.stroke(line.path);
      }
      ctx.globalAlpha = 1;
    }

    const zoomedIn = view.scale > 105;
    const casingColor = zoomedIn ? pal.casingNear : pal.casingFar;
    const casingPad = zoomedIn ? 1.55 : 0.95;

    for (const item of this.scene.tracks) {
      const line = this.geometry.get(item.id);
      if (!line || !touches(line.bounds, visible, .03)) continue;
      if (isStations) {
        ctx.strokeStyle = pal.railBase;
        ctx.lineWidth = (.85 * zoomWeight) / view.scale;
        ctx.stroke(line.path);
      } else {
        const dimmed = activeBand !== null && bandOf(item.value) !== activeBand;
        const w = flowWidth(item.value) * zoomWeight * (activeBand !== null && !dimmed ? 1.18 : 1);
        if (!dimmed) {
          // Crisp graphic separator casing so adjacent/crossing lines stay razor-distinct
          ctx.globalAlpha = 1;
          ctx.strokeStyle = casingColor;
          ctx.lineWidth = (w + casingPad) / view.scale;
          ctx.stroke(line.path);
        }
        ctx.globalAlpha = dimmed ? 0.11 : 1;
        ctx.strokeStyle = itemColor(item, theme, colorMode);
        ctx.lineWidth = w / view.scale;
        ctx.stroke(line.path);
      }
    }
    ctx.globalAlpha = 1;

    // Sibling segments along the same selected railway line
    if (siblingIds && siblingIds.size > 1 && selected?.kind === 'line') {
      for (const item of this.scene.tracks) {
        if (!siblingIds.has(item.id) || item.id === selected.item.id) continue;
        const line = this.geometry.get(item.id);
        if (!line || !touches(line.bounds, visible, .03)) continue;
        const w = Math.max(2.8, flowWidth(item.value) * zoomWeight + 1.4);
        ctx.lineWidth = (w + 3.4) / view.scale;
        ctx.strokeStyle = pal.siblingCasing;
        ctx.stroke(line.path);
        ctx.lineWidth = w / view.scale;
        ctx.strokeStyle = itemColor(item, theme, colorMode);
        ctx.stroke(line.path);
      }
    }

    // Hover highlight for line
    if (hoveredItem && !hoveredItem.point && hoveredItem.id !== selected?.item?.id) {
      const line = this.geometry.get(hoveredItem.id);
      if (line && touches(line.bounds, visible, .04)) {
        const w = Math.max(3.6, flowWidth(hoveredItem.value) * zoomWeight + 1.8);
        ctx.lineWidth = (w + 5.6) / view.scale;
        ctx.strokeStyle = pal.hoverHalo;
        ctx.stroke(line.path);
        ctx.lineWidth = (w + 2.2) / view.scale;
        ctx.strokeStyle = pal.selectCasing;
        ctx.stroke(line.path);
        ctx.lineWidth = w / view.scale;
        ctx.strokeStyle = itemColor(hoveredItem, theme, colorMode);
        ctx.stroke(line.path);
      }
    }

    // Active selected line Neo-Brutalist crisp double-casing spotlight
    if (selected?.kind === 'line') {
      const line = this.geometry.get(selected.item.id);
      if (line) {
        const width = Math.max(4.4, flowWidth(selected.value) * zoomWeight + 2.2);
        ctx.lineWidth = (width + 6.0) / view.scale;
        ctx.strokeStyle = pal.selectOuter;
        ctx.stroke(line.path);
        ctx.lineWidth = (width + 2.4) / view.scale;
        ctx.strokeStyle = pal.selectCasing;
        ctx.stroke(line.path);
        ctx.lineWidth = Math.max(2.0, width - 1.4) / view.scale;
        ctx.strokeStyle = pal.selectCore;
        ctx.stroke(line.path);
      }
    }
  }

  drawLabels(ctx, view, pal) {
    const language = this.scene.language === 'ja' ? 3 : this.scene.language === 'en' ? 4 : 2;
    const used = [];
    const drawLabel = (label, x, y, size, align, opts) => {
      if (x < 7 || x > this.width - 8 || y < 34 || y > this.height - 16) return;
      ctx.font = (opts.weight || 600) + ' ' + size + 'px ' + cityFont;
      const width = ctx.measureText(label).width;
      const left = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
      const extent = [left - 3, y - size / 2 - 2, left + width + 3, y + size / 2 + 2];
      if (used.some(bound => touches(bound, extent))) return;
      used.push(extent);
      text(ctx, label, x, y, { halo: pal.halo, ...opts, size, align });
    };

    const chosen = this.scene.selection;
    if (chosen?.kind === 'station') {
      const [sx, sy] = screen(project(chosen.item.point), view);
      drawLabel(this.callbacks.name(chosen.item.name), sx + 13, sy - 2, 12.8, 'left', {
        color: pal.cityMajorText, weight: 780,
      });
    }

    for (const place of water) {
      if (view.scale >= place[5] || view.scale < (place[6] || 0)) continue;
      const [x, y] = screen(project(place), view);
      drawLabel(place[language], x, y, language === 4 ? 10.5 : 12, 'center', { color: pal.waterText, weight: 580, halo: null });
    }
    if (view.scale < 138) {
      for (const place of otherPlaces) {
        const [x, y] = screen(project(place), view);
        drawLabel(place[language], x, y, 11, 'center', { color: pal.foreignText, weight: 650 });
      }
    }
    for (const place of cities) {
      const [x, y] = screen(project(place), view);
      const importance = place[5];
      if ((view.scale < 34 && importance > 1) || (view.scale < 76 && importance > 2)) continue;
      if (x < 7 || x > this.width - 8 || y < 33 || y > this.height - 16) continue;
      const large = importance === 1;
      ctx.beginPath();
      ctx.arc(x, y, large ? 3.2 : 2.3, 0, PI2);
      ctx.fillStyle = large ? pal.cityMajorDot : pal.cityMinorDot;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = pal.cityDotStroke;
      ctx.stroke();
      const align = place[6] < -3 ? 'right' : place[6] > 7 ? 'left' : 'center';
      drawLabel(place[language], x + place[6], y + place[7], large ? 12.8 : 11, align, {
        color: large ? pal.cityMajorText : pal.cityMinorText,
        weight: large ? 760 : 620,
      });
    }

    if (view.scale > 820) {
      const limit = this.scene.layer === 'stations' ? 22000 : 50000;
      for (const item of this.scene.stationsForLabels) {
        if (item.value < limit) continue;
        const [x, y] = screen(project(item.point), view);
        if (view.scale > 1450 && this.scene.layer !== 'stations' && x >= 0 && x < this.width && y >= 0 && y < this.height) {
          ctx.beginPath();
          ctx.arc(x, y, 2.3, 0, PI2);
          ctx.fillStyle = pal.stationPinFill;
          ctx.fill();
          ctx.strokeStyle = pal.stationPinStroke;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
        drawLabel(this.callbacks.name(item.name), x + 6, y - 7, 10.8, 'left', { color: pal.stationLabel, weight: 640 });
      }
    }
  }

  drawStations(ctx, view, pal) {
    const { selection: chosen, hoveredItem, activeBand, theme } = this.scene;
    for (const item of this.scene.stations) {
      const [x, y] = screen(project(item.point), view);
      const radius = stationSize(item.value) * (view.scale < 95 ? .64 : .92);
      if (x < -radius || x > this.width + radius || y < -radius || y > this.height + radius) continue;
      const dimmed = activeBand !== null && bandOf(item.value) !== activeBand;
      ctx.beginPath();
      ctx.arc(x, y, radius * (activeBand !== null && !dimmed ? 1.14 : 1), 0, PI2);
      ctx.globalAlpha = dimmed ? 0.10 : 0.84;
      ctx.fillStyle = flowColor(item.value, theme);
      ctx.fill();
      if (!dimmed && radius > 2.8) {
        ctx.globalAlpha = theme === 'dark' ? 0.85 : 0.55;
        ctx.strokeStyle = pal.stationStroke;
        ctx.lineWidth = .75;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Hovered station ring
    if (hoveredItem?.point && hoveredItem.id !== chosen?.item?.id) {
      const [hx, hy] = screen(project(hoveredItem.point), view);
      const r = Math.max(6.8, stationSize(hoveredItem.value) * (view.scale < 95 ? .64 : .92) + 2);
      ctx.beginPath();
      ctx.arc(hx, hy, r + 4, 0, PI2);
      ctx.fillStyle = pal.hoverHalo;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx, hy, r, 0, PI2);
      ctx.fillStyle = flowColor(hoveredItem.value, theme);
      ctx.fill();
      ctx.strokeStyle = '#18191b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Selected station crisp target marker
    if (chosen?.kind === 'station') {
      const [x, y] = screen(project(chosen.item.point), view);
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, PI2);
      ctx.fillStyle = pal.hoverHalo;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 9.2, 0, PI2);
      ctx.fillStyle = pal.selectCore;
      ctx.fill();
      ctx.strokeStyle = pal.selectCasing;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
  }

  draw() {
    if (!this.view) return;
    const ctx = this.ctx;
    const view = this.view;
    const pal = this.palette();
    const box = [-view.x / view.scale, -view.y / view.scale, (this.width - view.x) / view.scale, (this.height - view.y) / view.scale];
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = pal.ocean;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);
    this.drawBase(ctx, view, box, pal);
    this.drawLines(ctx, view, box, pal);
    ctx.restore();
    if (this.scene.layer === 'stations' || this.scene.hoveredItem?.point || this.scene.selection?.kind === 'station') {
      if (this.scene.layer === 'stations') {
        this.drawStations(ctx, view, pal);
      } else {
        const originalStations = this.scene.stations;
        this.scene.stations = [];
        this.drawStations(ctx, view, pal);
        this.scene.stations = originalStations;
      }
    }
    this.drawLabels(ctx, view, pal);
    this.callbacks.frame(view);
  }

  drawInset(canvas) {
    if (!canvas) return;
    const width = 128, height = 75;
    const pal = this.palette();
    const view = fit(regions.okinawa.bounds, width, height, 7);
    const box = [-view.x / view.scale, -view.y / view.scale, (width - view.x) / view.scale, (height - view.y) / view.scale];
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(this.dpr, this.dpr);
    ctx.fillStyle = pal.ocean;
    ctx.fillRect(0, 0, width, height);
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);
    this.drawBase(ctx, view, box, pal);
    this.drawLines(ctx, view, box, pal);
  }

  hit(px, py) {
    if (!this.view) return null;
    const { scale, x, y } = this.view;
    const { activeBand } = this.scene;
    if (this.scene.layer === 'stations') {
      let closest = null;
      let distance = Infinity;
      for (const item of this.scene.stations) {
        if (activeBand !== null && bandOf(item.value) !== activeBand) continue;
        const [sx, sy] = screen(project(item.point), this.view);
        const difference = (sx - px) ** 2 + (sy - py) ** 2;
        if (difference < distance && difference < Math.max(8, stationSize(item.value) + 2) ** 2) {
          closest = item;
          distance = difference;
        }
      }
      return closest ? { kind: 'station', item: closest } : null;
    }
    const worldX = (px - x) / scale;
    const worldY = (py - y) / scale;
    const radius = 11 / scale;
    let closest = null;
    let distance = radius ** 2;
    for (const item of this.scene.tracks) {
      if (activeBand !== null && bandOf(item.value) !== activeBand) continue;
      const geometry = this.geometry.get(item.id);
      if (!geometry || !touches(geometry.bounds, [worldX, worldY, worldX, worldY], radius)) continue;
      for (const part of geometry.parts) {
        for (let i = 1; i < part.length; i++) {
          const found = distanceSquared(worldX, worldY, part[i - 1], part[i]);
          if (found < distance || (found === distance && closest && item.value > closest.value)) {
            closest = item;
            distance = found;
          }
        }
      }
    }
    return closest ? { kind: 'line', item: closest } : null;
  }

  local(event) {
    const rect = this.canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  pinchState() {
    const [a, b] = this.pointers.values();
    if (!a || !b) return null;
    return { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, distance: Math.hypot(a[0] - b[0], a[1] - b[1]) };
  }

  bindInput() {
    const canvas = this.canvas;
    const listen = (event, handler, options = {}) => {
      canvas.addEventListener(event, handler, { ...options, signal: this.input.signal });
    };
    listen('pointerdown', event => {
      if (event.button !== 0) return;
      this.cancelAnimation();
      const point = this.local(event);
      this.pointers.set(event.pointerId, point);
      canvas.setPointerCapture(event.pointerId);
      if (this.pointers.size === 1) this.drag = { id: event.pointerId, start: point, last: point, moved: false };
      else {
        if (this.drag) this.drag.moved = true;
        this.pinch = this.pinchState();
      }
    });
    listen('pointermove', event => {
      const [x, y] = this.local(event);
      if (this.pointers.has(event.pointerId)) this.pointers.set(event.pointerId, [x, y]);
      if (this.pinch) {
        const next = this.pinchState();
        if (!next) return;
        this.pan(next.x - this.pinch.x, next.y - this.pinch.y);
        this.zoom(next.distance / Math.max(this.pinch.distance, 1), next.x, next.y);
        this.pinch = next;
        return;
      }
      if (this.drag?.id === event.pointerId) {
        if (Math.hypot(x - this.drag.start[0], y - this.drag.start[1]) > 4) this.drag.moved = true;
        if (this.drag.moved) {
          canvas.classList.add('dragging');
          this.pan(x - this.drag.last[0], y - this.drag.last[1]);
          this.drag.last = [x, y];
        }
      } else if (event.pointerType === 'mouse') {
        const found = this.hit(x, y);
        canvas.classList.toggle('over-item', !!found);
        this.callbacks.hover(found, x, y);
      }
    });
    const endPointer = event => {
      this.pointers.delete(event.pointerId);
      if (this.pinch) {
        this.pinch = this.pinchState();
        const [remaining] = this.pointers;
        this.drag = remaining ? { id: remaining[0], start: remaining[1], last: remaining[1], moved: true } : null;
      } else if (this.drag?.id === event.pointerId) {
        if (!this.drag.moved && event.type === 'pointerup') this.callbacks.select(this.hit(...this.local(event)));
        this.drag = null;
      }
      if (!this.pointers.size) canvas.classList.remove('dragging');
    };
    listen('pointerup', endPointer);
    listen('pointercancel', endPointer);
    listen('pointerleave', () => {
      canvas.classList.remove('over-item');
      this.callbacks.hover(null);
    });
    listen('wheel', event => {
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? 90 : 1);
      this.zoom(Math.exp(Math.max(-1.35, Math.min(1.35, -pixels * .0017))), ...this.local(event));
    }, { passive: false });
    listen('dblclick', event => this.zoom(1.7, ...this.local(event)));
    listen('contextmenu', event => {
      const found = this.hit(...this.local(event));
      if (found) {
        event.preventDefault();
        this.callbacks.select(found);
      }
    });
    listen('keydown', event => {
      const move = { ArrowUp: [0, 53], ArrowDown: [0, -53], ArrowLeft: [53, 0], ArrowRight: [-53, 0] }[event.key];
      if (move) this.pan(...move);
      else if (event.key === '+' || event.key === '=') this.zoom(1.45);
      else if (event.key === '-') this.zoom(1 / 1.45);
      else return;
      event.preventDefault();
    });
  }
}
