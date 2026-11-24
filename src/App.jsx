import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  compareReadings, isCensus, kindOf, lineCandidates, loadAtlas,
  onePerGroup, readingInView, regionalRanking, searchRecords, summarizeRecords, withReadings,
} from './data.js';
import Icon from './Icon.jsx';
import {
  labelsFor, languageStorageKey, sources, storedLanguage, storedTheme, themeStorageKey,
} from './locales.js';
import MapView from './MapView.jsx';
import RailPanel from './RailPanel.jsx';

const PAGE_SIZE = 15;
const EMPTY = [];
const initialView = {
  region: 'nation',
  layer: 'lines',
  mode: 'national',
  colorMode: 'flow',
  category: 'all',
  operator: null,
  band: null,
  sort: 'volume',
  years: { lines: 'latest', stations: 'latest' },
  selection: null,
  query: '',
  limit: PAGE_SIZE,
};

function MethodDialog({ labels, dialog }) {
  const { t, copy } = labels;
  return (
    <dialog
      id="method-dialog"
      aria-labelledby="method-title"
      ref={dialog}
      onClick={event => {
        if (event.target === dialog.current) dialog.current.close();
      }}
      className="m-auto w-[min(600px,calc(100%-24px))] max-h-[calc(100dvh-40px)] rounded-xl bg-[#f3f0e8] dark:bg-[#14171f] text-[#18191b] dark:text-slate-100 border-2 border-[#18191b] dark:border-[#454d5e] p-0 shadow-brutal-lg overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-[#fffef9] dark:bg-[#191d26] border-b-[1.5px] border-[#18191b] dark:border-[#383f4e]">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-[5px] bg-[#ffd25a] text-[#18191b] border-[1.5px] border-[#18191b] grid place-items-center">
            <Icon name="info" className="w-4 h-4" />
          </span>
          <h2 id="method-title" className="text-base font-extrabold tracking-tight">
            {t('method')}
          </h2>
        </div>
        <form method="dialog">
          <button
            type="submit"
            aria-label={t('close')}
            className="brutal-btn w-7 h-7 rounded-[5px] grid place-items-center border border-[#18191b]/30 text-zinc-700 hover:bg-[#ffd25a] dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </form>
      </div>
      <div className="px-5 py-4 overflow-y-auto max-h-[calc(100dvh-120px)] thin-scroll space-y-3">
        {copy.methodSections.map(([heading, body]) => (
          <div
            key={heading}
            className="rounded-lg bg-[#fffef9] dark:bg-[#191d26] border-[1.5px] border-[#1e2022] dark:border-[#383f4e] shadow-brutal-xs p-3.5"
          >
            <h3 className="text-sm font-extrabold text-[#18191b] dark:text-white mb-1">{heading}</h3>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-slate-300">{body}</p>
          </div>
        ))}
        <div className="pt-1">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-slate-400 mb-2">
            {t('source')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {sources.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-btn inline-flex items-center gap-1.5 rounded-[5px] bg-[#fffef9] dark:bg-[#191d26] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-xs px-2.5 py-1.5 text-xs font-bold text-[#18191b] dark:text-[#ffd25a] hover:bg-[#ffd25a] dark:hover:bg-[#252b38]"
              >
                <span>{copy.sourceLabels[index]}</span>
                <Icon name="external" className="w-3 h-3 opacity-80" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  );
}

const LANGUAGES = [
  { code: 'zh', short: '简', label: '简体中文' },
  { code: 'ja', short: '日', label: '日本語' },
  { code: 'en', short: 'EN', label: 'English' },
];

function Header({ labels, theme, onLanguage, onToggleTheme, onMethod }) {
  const { language, t } = labels;
  return (
    <header className="h-[60px] px-3.5 sm:px-5 flex items-center justify-between gap-3 bg-[#fffef9] dark:bg-[#161920] border-b-[1.5px] border-[#1e2022] dark:border-[#323846] relative z-30">
      <a className="flex items-center gap-2.5 sm:gap-3 no-underline group min-w-0" href="./" aria-label={t('title')}>
        <img
          src={import.meta.env.BASE_URL + 'rail.svg'}
          alt=""
          width="36"
          height="36"
          className="w-9 h-9 shrink-0 group-hover:-translate-y-0.5 transition-transform"
        />
        <span className="grid leading-tight min-w-0">
          <strong className="text-[15px] sm:text-base font-extrabold tracking-tight text-[#18191b] dark:text-white truncate">
            {t('title')}
          </strong>
          <span className="font-mono text-[10px] font-extrabold tracking-[0.14em] text-zinc-500 dark:text-[#ffd25a] uppercase">
            JAPAN RAIL ATLAS
          </span>
        </span>
      </a>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
          className="brutal-btn inline-flex items-center gap-1.5 rounded-[6px] h-8.5 px-2.5 sm:px-3 text-xs font-bold bg-[#f3f0e8] hover:bg-[#ffd25a] text-[#18191b] border-[1.5px] border-[#1e2022] shadow-brutal-xs dark:bg-[#222733] dark:border-[#3c4352] dark:text-slate-200 dark:hover:bg-[#2d3342]"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-3.5 h-3.5 text-[#18191b] dark:text-[#ffd25a]" />
          <span className="hidden sm:inline">
            {theme === 'dark' ? t('themeDarkShort') : t('themeLightShort')}
          </span>
        </button>

        <button
          type="button"
          onClick={onMethod}
          className="brutal-btn inline-flex items-center gap-1.5 rounded-[6px] h-8.5 px-2.5 sm:px-3 text-xs font-bold bg-[#fffef9] hover:bg-[#ffd25a] text-[#18191b] border-[1.5px] border-[#1e2022] shadow-brutal-xs dark:bg-[#222733] dark:border-[#3c4352] dark:text-slate-200 dark:hover:bg-[#2d3342]"
        >
          <Icon name="info" className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('method')}</span>
        </button>

        {/* Neo-Brutalist Segmented Language Switch */}
        <div
          role="group"
          aria-label="语言 / Language"
          className="inline-flex items-center rounded-[6px] bg-[#f3f0e8] dark:bg-[#111317] p-0.5 border-[1.5px] border-[#1e2022] dark:border-[#3c4352]"
        >
          {LANGUAGES.map(opt => {
            const active = language === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                title={opt.label}
                aria-pressed={active}
                onClick={() => onLanguage(opt.code)}
                className={`rounded-[4px] px-2 py-1 font-mono text-[11px] font-extrabold transition-colors ${
                  active
                    ? 'bg-[#18191b] text-[#fffef9] dark:bg-[#ffd25a] dark:text-[#18191b]'
                    : 'text-zinc-600 dark:text-slate-400 hover:text-[#18191b] dark:hover:text-white'
                }`}
              >
                {opt.short}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [language, setLanguage] = useState(storedLanguage);
  const [theme, setTheme] = useState(storedTheme);
  const [view, setView] = useState(initialView);
  const [resource, setResource] = useState({ status: 'loading', data: null });
  const [attempt, setAttempt] = useState(0);
  const [camera, setCamera] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [previewBand, setPreviewBand] = useState(null);
  const [showMobileDetail, setShowMobileDetail] = useState(null);

  const searchRef = useRef(null);
  const dialog = useRef(null);
  const stage = useRef(null);
  const panel = useRef(null);

  const labels = useMemo(() => labelsFor(language), [language]);
  const { data, status } = resource;
  const { layer, mode, colorMode, category, operator, band, sort, region, years, query } = view;
  const record = data?.byId.get(view.selection) ?? null;

  useEffect(() => {
    const abort = new AbortController();
    loadAtlas(abort.signal).then(next => {
      if (!abort.signal.aborted) setResource({ status: 'ready', data: next });
    }).catch(error => {
      if (abort.signal.aborted) return;
      console.error(error);
      setResource({ status: 'error', data: null });
    });
    return () => abort.abort();
  }, [attempt]);

  useEffect(() => {
    document.documentElement.lang = labels.tag;
    document.title = labels.t('title');
    try {
      localStorage.setItem(languageStorageKey, language);
    } catch {
      // Ignore storage errors
    }
  }, [labels, language]);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#111317' : '#f3f0e8');
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const shortcut = event => {
      if (dialog.current?.open) return;
      const editing = event.target instanceof Element && event.target.matches('input, textarea, select, [contenteditable]');
      if ((event.key === '/' && !editing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key === 'Escape' && event.target === searchRef.current) {
        setView(current => ({ ...current, query: '', selection: null, limit: PAGE_SIZE }));
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);

  useLayoutEffect(() => {
    if (!showMobileDetail) return;
    const detail = panel.current?.querySelector('article');
    if (detail) {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      detail.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest' });
    }
  }, [showMobileDetail]);

  const matchingLines = useMemo(
    () => data ? withReadings(lineCandidates(data, mode, category, operator), years.lines) : EMPTY,
    [data, mode, category, operator, years.lines],
  );

  const tracks = useMemo(() => {
    const baseLines = layer === 'stations' && data
      ? withReadings(operator ? data.lines.filter(l => l.operator === operator) : data.lines, 'latest')
      : matchingLines;
    return baseLines.filter(item => item.value != null).sort((a, b) => a.value - b.value);
  }, [data, layer, operator, matchingLines]);

  const stationRows = useMemo(() => {
    if (!data) return EMPTY;
    const pool = operator ? data.stations.filter(s => s.operator === operator) : data.stations;
    return withReadings(pool, years.stations);
  }, [data, operator, years.stations]);

  const stationGroups = useMemo(
    () => onePerGroup(stationRows.filter(item => item.value != null).sort(compareReadings)),
    [stationRows],
  );
  const markers = useMemo(() => stationGroups.slice().reverse(), [stationGroups]);

  const activeBand = previewBand !== null ? previewBand : band;

  const regionalAll = useMemo(
    () => regionalRanking(layer === 'stations' ? stationGroups : tracks, region, null, mode === 'census' && layer === 'lines' ? 'volume' : sort),
    [layer, stationGroups, tracks, region, mode, sort],
  );

  const nearby = useMemo(
    () => band === null ? regionalAll : regionalRanking(layer === 'stations' ? stationGroups : tracks, region, band, mode === 'census' && layer === 'lines' ? 'volume' : sort),
    [regionalAll, layer, stationGroups, tracks, region, band, mode, sort],
  );

  const summary = useMemo(() => summarizeRecords(regionalAll), [regionalAll]);

  const results = useMemo(() => {
    if (!query.trim()) return nearby;
    const choices = layer === 'stations' ? [...stationRows, ...matchingLines] : [...matchingLines, ...stationRows];
    return searchRecords(choices, query);
  }, [layer, nearby, query, matchingLines, stationRows]);

  const siblings = useMemo(() => (record && data ? data.groups.get(record.group) ?? EMPTY : EMPTY), [data, record]);
  const siblingIds = useMemo(
    () => (record && kindOf(record) === 'line' && siblings.length > 1 ? new Set(siblings.map(s => s.id)) : null),
    [record, siblings],
  );

  const selectionReading = record ? readingInView(record, view).value : null;

  const scene = useMemo(() => ({
    theme,
    colorMode: layer === 'lines' ? colorMode : 'flow',
    language,
    layer,
    tracks,
    stations: markers,
    stationsForLabels: stationGroups,
    selection: record ? { kind: kindOf(record), item: record, value: selectionReading } : null,
    hoveredItem,
    siblingIds,
    activeBand,
  }), [theme, colorMode, language, layer, tracks, markers, stationGroups, record, selectionReading, hoveredItem, siblingIds, activeBand]);

  function goRegion(nextRegion) {
    setView(current => ({ ...current, region: nextRegion, selection: null, limit: PAGE_SIZE }));
    setCamera({ region: nextRegion });
  }

  function filter(change) {
    if (change.year) {
      setView(current => ({ ...current, years: { ...current.years, [current.layer]: change.year }, limit: PAGE_SIZE }));
      return;
    }
    if (Object.entries(change).every(([key, value]) => view[key] === value)) return;
    const nation = change.mode === 'census' && ['fukuoka', 'sapporo', 'okinawa'].includes(region);
    const keepSelection = 'operator' in change || 'band' in change || 'sort' in change || 'colorMode' in change;
    setView(current => ({
      ...current,
      ...change,
      band: change.colorMode === 'type' ? null : ('band' in change ? change.band : current.band),
      region: nation ? 'nation' : current.region,
      selection: keepSelection ? current.selection : null,
      limit: PAGE_SIZE,
    }));
    if (nation) setCamera({ region: 'nation' });
  }

  function choose(id, { locate = true, mapClick = false } = {}) {
    const item = data?.byId.get(id);
    setHoveredItem(null);
    if (!item) {
      setView(current => current.selection ? { ...current, selection: null, limit: PAGE_SIZE } : current);
      return;
    }
    const station = kindOf(item) === 'station';
    setView(current => ({
      ...current,
      selection: id,
      layer: station ? 'stations' : 'lines',
      mode: station ? current.mode : isCensus(item) ? 'census' : 'national',
    }));
    if (locate) setCamera({ item });
    if (mapClick && window.matchMedia('(max-width: 767px)').matches) setShowMobileDetail({ id });
  }

  function locateRecord(item) {
    setCamera({ item });
    if (window.matchMedia('(max-width: 767px)').matches) stage.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function retry() {
    setResource({ status: 'loading', data: null });
    setAttempt(current => current + 1);
  }

  let statusText = '';
  if (data) {
    if (layer === 'stations') {
      statusText = labels.t('stationView', { n: labels.number(nearby.length) });
    } else {
      statusText = mode === 'census' ? labels.t('censusView') : labels.t('lineView', { n: labels.number(nearby.length) });
    }
  }

  return (
    <>
      <Header
        labels={labels}
        theme={theme}
        onLanguage={setLanguage}
        onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        onMethod={() => dialog.current?.showModal()}
      />
      <main className="flex flex-col md:grid md:grid-cols-[344px_minmax(0,1fr)] lg:grid-cols-[372px_minmax(0,1fr)] md:h-[calc(100dvh-60px)] md:min-h-[560px]">
        <RailPanel
          labels={labels}
          theme={theme}
          view={view}
          results={results}
          summary={summary}
          status={status}
          record={record}
          siblings={siblings}
          searchRef={searchRef}
          panelRef={panel}
          onQuery={next => setView(current => ({ ...current, query: next, selection: null, limit: PAGE_SIZE }))}
          onFilter={filter}
          onSelect={choose}
          onHoverItem={setHoveredItem}
          onPreviewBand={setPreviewBand}
          onLocate={locateRecord}
          onBack={() => choose(null)}
          onMore={() => setView(current => ({ ...current, limit: current.limit + PAGE_SIZE }))}
          onRetry={retry}
        />
        <MapView
          base={data?.base}
          scene={scene}
          theme={theme}
          view={view}
          camera={camera}
          labels={labels}
          statusText={statusText}
          stageRef={stage}
          onPick={item => choose(item?.id, { locate: false, mapClick: true })}
          onRegion={goRegion}
          onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          onPreviewBand={setPreviewBand}
          onToggleBand={nextBand => filter({ band: nextBand })}
          onFilter={filter}
        />
      </main>
      <MethodDialog labels={labels} dialog={dialog} />
    </>
  );
}
