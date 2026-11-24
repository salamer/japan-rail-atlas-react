import { useLayoutEffect, useRef, useState } from 'react';
import { CATEGORY_DOT, kindOf, measureOf, scopeOf } from './data.js';
import Icon from './Icon.jsx';
import { flowColor, flowWidth, itemColor, limits, RailMap, regions, stationSize, typeColor } from './rail-map.js';

const formatScale = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });
const TYPE_KEYS = ['highspeed', 'jr', 'metro', 'other'];

function writeScale(element, view, canvasHeight) {
  if (!element) return;
  const latitude = 35 - (canvasHeight / 2 - view.y) / view.scale;
  const kmFor100 = 100 / view.scale / .81 * 111.195 * Math.cos(latitude * Math.PI / 180);
  const magnitude = 10 ** Math.floor(Math.log10(kmFor100));
  const distance = [5, 2, 1].find(factor => factor * magnitude <= kmFor100) * magnitude;
  const text = distance < 1 ? Math.round(distance * 1000) + ' m' : formatScale.format(distance) + ' km';
  if (element.firstElementChild.textContent !== text) element.firstElementChild.textContent = text;
  element.lastElementChild.style.width = (100 * distance / kmFor100) + 'px';
}

function Legend({
  labels, theme, stationMode, censusMode, colorMode, category,
  lockedBand, onPreviewBand, onToggleBand, onColorMode, onCategory,
}) {
  const { t, language } = labels;
  const title = stationMode ? 'stationMetric' : censusMode ? 'censusMetric' : 'routeMetric';
  const isTypeColor = !stationMode && colorMode === 'type';
  const hint = isTypeColor ? 'typeWidthHint' : (stationMode ? 'stationHint' : censusMode ? 'censusHint' : 'routeHint');
  const bands = language === 'en'
    ? ['<1k', '1k', '3k', '10k', '30k', '100k', '300k+']
    : ['<1千', '1千', '3千', '1万', '3万', '10万', '30万+'];

  return (
    <div className="absolute bottom-3 left-2.5 md:bottom-5 md:left-5 max-w-[calc(100%-78px)] md:max-w-[calc(100%-210px)] rounded-lg bg-[#fffef9]/96 dark:bg-[#181c24]/95 backdrop-blur-xs border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal dark:shadow-brutal-dark px-3 py-2.5 md:px-3.5 md:py-3 pointer-events-auto">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
          <strong className="text-xs font-extrabold tracking-tight text-[#18191b] dark:text-white">
            {t(title)}
          </strong>
          <span className="hidden sm:inline text-[11px] font-medium text-zinc-500 dark:text-slate-400">
            {t(hint)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {lockedBand !== null && !isTypeColor && (
            <button
              type="button"
              onClick={() => onToggleBand(null)}
              className="text-[11px] font-bold text-[#d81b52] dark:text-rose-400 hover:underline px-1"
            >
              {t('clearFilters')}
            </button>
          )}
          {!stationMode && (
            <div className="inline-flex rounded-[5px] border border-[#1e2022]/80 dark:border-[#454d5e] bg-[#f3f0e8] dark:bg-[#111317] p-0.5">
              {['flow', 'type'].map(mode => {
                const active = colorMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onColorMode(mode)}
                    className={`rounded-[3px] px-2 py-0.5 text-[10.5px] font-bold transition-colors ${
                      active
                        ? 'bg-[#18191b] text-[#fffef9] dark:bg-[#ffd25a] dark:text-[#18191b]'
                        : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {t(mode === 'flow' ? 'colorByFlow' : 'colorByType')}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isTypeColor ? (
        <div className="flex items-center flex-wrap gap-1.5">
          {TYPE_KEYS.map(typeKey => {
            const selected = category === typeKey;
            const dimmed = category !== 'all' && !selected;
            return (
              <button
                key={typeKey}
                type="button"
                aria-pressed={selected}
                onClick={() => onCategory(selected ? 'all' : typeKey)}
                className={`brutal-btn inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  selected
                    ? 'bg-[#ffd25a] text-[#18191b] border-[#18191b] shadow-brutal-xs'
                    : 'bg-white dark:bg-[#222733] text-zinc-800 dark:text-slate-200 border-[#1e2022]/25 dark:border-slate-700 hover:border-[#1e2022]'
                } ${dimmed ? 'opacity-45 hover:opacity-95' : ''}`}
              >
                <span
                  className="w-4 h-1.5 rounded-[2px] shrink-0"
                  style={{ backgroundColor: typeColor(typeKey, theme) }}
                />
                <span>{t(typeKey)}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-end flex-wrap gap-1">
          {[350, ...limits].map((sample, index) => {
            const size = stationMode ? stationSize(sample) * .68 : flowWidth(sample);
            const color = flowColor(sample, theme);
            const isSelected = lockedBand === index;
            const isDimmed = lockedBand !== null && !isSelected;
            return (
              <button
                key={sample}
                type="button"
                aria-pressed={isSelected}
                onMouseEnter={() => onPreviewBand(index)}
                onMouseLeave={() => onPreviewBand(null)}
                onClick={() => onToggleBand(isSelected ? null : index)}
                className={`group flex flex-col items-center gap-1 rounded-[5px] px-1.5 py-1 min-w-[34px] sm:min-w-[40px] border transition-all ${
                  isSelected
                    ? 'bg-[#ffd25a]/45 dark:bg-[#ffd25a]/20 border-[#18191b] dark:border-[#ffd25a] shadow-brutal-xs'
                    : 'border-transparent hover:bg-[#f3f0e8] dark:hover:bg-[#232834] hover:border-[#1e2022]/30'
                } ${isDimmed ? 'opacity-35 hover:opacity-90' : ''}`}
              >
                <span className="h-3.5 flex items-center justify-center">
                  {stationMode ? (
                    <span
                      className="block rounded-full border border-[#18191b]/40 dark:border-black/50 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: color,
                        width: Math.max(4.5, size).toFixed(1) + 'px',
                        height: Math.max(4.5, size).toFixed(1) + 'px',
                      }}
                    />
                  ) : (
                    <span
                      className="block w-6 sm:w-7 rounded-[2px] transition-transform group-hover:scale-x-105"
                      style={{
                        backgroundColor: color,
                        height: Math.max(2.6, size).toFixed(1) + 'px',
                      }}
                    />
                  )}
                </span>
                <span className="font-mono text-[10px] sm:text-[10.5px] font-bold tabular-nums text-zinc-700 dark:text-slate-300 whitespace-nowrap">
                  {bands[index]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Tooltip({ hover, theme, colorMode, labels, stage }) {
  const ref = useRef(null);
  const { x, y, item } = hover;
  const { t, name, number, pct } = labels;
  const [, unit] = measureOf(item);
  const isStation = kindOf(item) === 'station';
  const swatch = itemColor(item, theme, colorMode);

  useLayoutEffect(() => {
    const tip = ref.current;
    if (!tip || !stage) return;
    tip.style.left = Math.max(8, Math.min(x + 14, stage.clientWidth - tip.offsetWidth - 10)) + 'px';
    tip.style.top = Math.max(8, Math.min(y + 14, stage.clientHeight - tip.offsetHeight - 10)) + 'px';
  });

  return (
    <div
      ref={ref}
      className="absolute z-30 max-w-[min(276px,78%)] pointer-events-none rounded-lg bg-[#fffef9] dark:bg-[#181c24] border-[1.5px] border-[#1e2022] dark:border-[#454d5e] shadow-brutal dark:shadow-brutal-dark px-3 py-2.5 text-xs leading-snug"
    >
      <div className="flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-[3px] border border-[#18191b]/40 shrink-0"
          style={{ backgroundColor: swatch }}
        />
        <strong className="font-extrabold text-[13px] text-[#18191b] dark:text-white truncate">
          {name(item.name)}
        </strong>
        {!isStation && item.type && (
          <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOT[item.type]}`} />
        )}
      </div>
      <div className="mt-1 text-[11.5px] font-medium text-zinc-600 dark:text-slate-400 truncate">
        {[name(item.operator), scopeOf(item, name) || (isStation && name(item.line))].filter(Boolean).join(' · ')}
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-[#1e2022]/15 dark:border-white/10 flex items-baseline justify-between gap-3">
        <span className="font-mono font-extrabold text-[13px] tabular-nums text-[#18191b] dark:text-white">
          {item.value == null ? t('noData') : number(item.value)}{' '}
          <span className="font-sans text-[10.5px] font-medium text-zinc-500 dark:text-slate-400">{t(unit)}</span>
        </span>
        {item.vs2019 != null && (
          <span className={`font-mono text-[10.5px] font-bold tabular-nums px-1 py-0.2 rounded-[3px] ${
            item.vs2019 >= 100
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {pct(item.vs2019)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MapView({
  base, scene, theme, view, camera, statusText, labels, stageRef,
  onPick, onRegion, onToggleTheme, onPreviewBand, onToggleBand, onFilter,
}) {
  const { t } = labels;
  const canvas = useRef(null);
  const insetCanvas = useRef(null);
  const scale = useRef(null);
  const engine = useRef(null);
  const handlers = useRef({ onPick, labels, scene });
  const [hover, setHover] = useState(null);
  const stationMode = view.layer === 'stations';
  const censusMode = !stationMode && view.mode === 'census';
  const showInset = !!base && view.region === 'nation' && !censusMode;

  useLayoutEffect(() => {
    handlers.current = { onPick, labels, scene };
  }, [onPick, labels, scene]);

  useLayoutEffect(() => {
    if (!base) return;
    const map = new RailMap(canvas.current, base, {
      select: hit => handlers.current.onPick(hit?.item ?? null),
      hover: (hit, x, y) => setHover(hit ? { item: hit.item, x, y, scene: handlers.current.scene } : null),
      frame: currentView => writeScale(scale.current, currentView, map.height),
      name: value => handlers.current.labels.name(value),
    });
    engine.current = map;
    return () => {
      map.destroy();
      engine.current = null;
    };
  }, [base]);

  useLayoutEffect(() => {
    if (!engine.current) return;
    engine.current.setScene(scene);
    if (showInset) engine.current.drawInset(insetCanvas.current);
  }, [base, scene, showInset]);

  useLayoutEffect(() => {
    if (!engine.current || !camera) return;
    if (camera.region) engine.current.fitTo(regions[camera.region].bounds);
    else if (camera.item.point) engine.current.locateStation(camera.item);
    else engine.current.locateTrack(camera.item);
  }, [base, camera]);

  const activeHoverItem = hover && hover.scene === scene ? hover.item : null;

  useLayoutEffect(() => {
    if (!engine.current) return;
    if (activeHoverItem && !scene.hoveredItem) {
      engine.current.setScene({ ...scene, hoveredItem: activeHoverItem });
    } else if (!activeHoverItem && engine.current.scene.hoveredItem && !scene.hoveredItem) {
      engine.current.setScene(scene);
    }
  }, [activeHoverItem, scene]);

  return (
    <section
      id="map-stage"
      ref={stageRef}
      aria-label={t('mapLabel')}
      className="relative order-[-1] md:order-none h-[56svh] min-h-[360px] md:h-auto min-w-0 overflow-hidden bg-[#d4e4ec] dark:bg-[#0c0f15] isolate select-none"
    >
      <canvas
        id="map"
        ref={canvas}
        tabIndex="0"
        aria-label={t('mapLabel')}
        aria-describedby="map-help"
        className="w-full h-full block focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#18191b] dark:focus-visible:outline-[#ffd25a]"
      />
      <span className="sr-only" id="map-help">{t('keyboardHelp')}</span>

      {/* Top Floating Region Bar & Live Status */}
      <div className="absolute top-2.5 left-2.5 right-2.5 md:top-4 md:left-5 md:right-5 flex flex-wrap justify-between items-start gap-2 pointer-events-none">
        <nav
          aria-label={t('regionLabel')}
          className="flex max-w-full overflow-x-auto no-scrollbar gap-1 p-1 pointer-events-auto rounded-lg bg-[#fffef9]/96 dark:bg-[#181c24]/95 border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal dark:shadow-brutal-dark"
        >
          {Object.entries(regions).map(([key, region]) => {
            const active = view.region === key;
            return (
              <button
                type="button"
                key={key}
                data-region={key}
                aria-pressed={active}
                onClick={() => onRegion(key)}
                className={`brutal-btn shrink-0 rounded-[5px] px-2.5 py-1 text-xs font-bold border transition-all ${
                  active
                    ? 'bg-[#ffd25a] text-[#18191b] border-[#18191b] shadow-brutal-xs'
                    : 'border-transparent text-zinc-700 dark:text-slate-200 hover:bg-[#f3f0e8] dark:hover:bg-[#252b38]'
                }`}
              >
                {t(region.label)}
              </button>
            );
          })}
        </nav>
        {statusText && (
          <div
            role="status"
            className="hidden lg:inline-flex items-center rounded-lg bg-[#fffef9]/95 dark:bg-[#181c24]/95 border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-sm dark:shadow-brutal-dark-sm px-3 py-1.5 font-mono text-xs font-bold text-[#18191b] dark:text-slate-200"
          >
            {statusText}
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {hover && hover.scene === scene && (
        <Tooltip hover={hover} theme={theme} colorMode={view.colorMode} labels={labels} stage={stageRef.current} />
      )}

      {/* Interactive 7-Tier / Category Legend */}
      <Legend
        labels={labels}
        theme={theme}
        stationMode={stationMode}
        censusMode={censusMode}
        colorMode={view.colorMode}
        category={view.category}
        lockedBand={view.band}
        onPreviewBand={onPreviewBand}
        onToggleBand={onToggleBand}
        onColorMode={nextMode => onFilter({ colorMode: nextMode })}
        onCategory={nextCat => onFilter({ category: nextCat })}
      />

      {/* Okinawa Inset Mini-Map */}
      {showInset && (
        <button
          type="button"
          id="okinawa-inset"
          onClick={() => onRegion('okinawa')}
          className="brutal-btn hidden md:grid absolute bottom-14 right-[70px] overflow-hidden text-left rounded-lg border-[1.5px] border-[#1e2022] dark:border-[#3c4352] bg-[#fffef9] dark:bg-[#181c24] text-[#18191b] dark:text-slate-200 shadow-brutal dark:shadow-brutal-dark hover:-translate-y-0.5"
        >
          <span className="px-2.5 py-1 text-[11px] font-extrabold border-b-[1.5px] border-[#1e2022] dark:border-[#3c4352] bg-[#f3f0e8] dark:bg-[#222733]">
            {t('okinawa')}
          </span>
          <canvas ref={insetCanvas} id="inset-map" width="128" height="75" aria-hidden="true" className="block w-[128px] h-[75px]" />
        </button>
      )}

      {/* Soft Neo-Brutalist Map Control Stack */}
      <div className="absolute right-2.5 bottom-12 md:right-5 md:bottom-14 grid gap-2">
        <button
          type="button"
          aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          onClick={onToggleTheme}
          className="brutal-btn grid place-items-center w-9.5 h-9.5 rounded-lg bg-[#fffef9] dark:bg-[#181c24] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] text-[#18191b] dark:text-[#ffd25a] shadow-brutal-sm dark:shadow-brutal-dark-sm hover:bg-[#ffd25a] dark:hover:bg-[#252b38]"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-[17px] h-[17px]" />
        </button>

        <button
          type="button"
          id="restore-view"
          aria-label={t('reset')}
          title={t('reset')}
          onClick={() => onRegion('nation')}
          className="brutal-btn grid place-items-center content-center gap-0.5 w-9.5 h-9.5 rounded-lg bg-[#fffef9] dark:bg-[#181c24] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] text-[#18191b] dark:text-slate-100 shadow-brutal-sm dark:shadow-brutal-dark-sm hover:bg-[#f3f0e8] dark:hover:bg-[#252b38] font-mono text-[9px] font-extrabold"
        >
          <span aria-hidden="true">N</span>
          <span
            aria-hidden="true"
            className="w-3 h-4 block"
            style={{
              background: 'linear-gradient(155deg, #e63946 0 52%, #94a3b8 53%)',
              clipPath: 'polygon(50% 0, 100% 100%, 50% 73%, 0 100%)',
            }}
          />
        </button>

        <div className="rounded-lg overflow-hidden bg-[#fffef9] dark:bg-[#181c24] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-sm dark:shadow-brutal-dark-sm divide-y-[1.5px] divide-[#1e2022] dark:divide-[#3c4352]">
          <button
            type="button"
            id="zoom-in"
            aria-label={t('zoomIn')}
            onClick={() => engine.current?.zoom(1.54)}
            className="grid place-items-center w-9.5 h-9.5 text-[#18191b] dark:text-slate-200 hover:bg-[#ffd25a] dark:hover:bg-[#252b38] transition-colors"
          >
            <Icon name="plus" className="w-[17px] h-[17px]" />
          </button>
          <button
            type="button"
            id="zoom-out"
            aria-label={t('zoomOut')}
            onClick={() => engine.current?.zoom(1 / 1.54)}
            className="grid place-items-center w-9.5 h-9.5 text-[#18191b] dark:text-slate-200 hover:bg-[#ffd25a] dark:hover:bg-[#252b38] transition-colors"
          >
            <Icon name="minus" className="w-[17px] h-[17px]" />
          </button>
        </div>
      </div>

      {/* Scale Bar & Attribution */}
      <div className="absolute right-2.5 md:right-5 bottom-2 grid justify-items-end gap-1 pointer-events-none">
        <div
          ref={scale}
          aria-hidden="true"
          className="grid justify-items-center font-mono text-[10.5px] font-bold text-[#18191b] dark:text-slate-300 leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
        >
          <span />
          <i className="block h-1.5 border-b-[1.5px] border-x-[1.5px] border-[#18191b] dark:border-slate-400 min-w-[10px] mt-0.5" />
        </div>
        <span className="font-mono text-[10px] font-bold text-zinc-700 dark:text-slate-400 px-1.5 py-0.5 rounded-[4px] bg-[#fffef9]/85 dark:bg-[#181c24]/85 border border-[#1e2022]/30 dark:border-slate-700">
          Natural Earth · MLIT · GTFS-GIS
        </span>
      </div>
    </section>
  );
}
