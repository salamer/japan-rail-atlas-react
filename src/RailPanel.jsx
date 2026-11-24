import { useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import {
  CATEGORIES, CATEGORY_BADGE, CATEGORY_DOT, isCensus, kindOf, measureOf, readingInView, scopeOf, YEARS,
} from './data.js';
import { sources } from './locales.js';
import { flowColor, itemColor, limits } from './rail-map.js';

const BAND_LABELS_ZH = ['<1千', '1千–3千', '3千–1万', '1万–3万', '3万–10万', '10万–30万', '30万+'];
const BAND_LABELS_EN = ['<1k', '1k–3k', '3k–10k', '10k–30k', '30k–100k', '100k–300k', '300k+'];
const BAND_SAMPLES = [350, ...limits];

function TrendBadge({ value, isRatio = false, labels }) {
  if (value == null || !isFinite(value)) return null;
  const delta = isRatio ? value - 100 : value;
  const positive = delta >= 0.5;
  const negative = delta <= -0.5;
  const tone = positive
    ? 'bg-[#e3f7ec] text-[#086f38] border-[#0f9d52]/40 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-400/35'
    : negative
      ? 'bg-[#ffe8ec] text-[#b8143a] border-[#d81b52]/35 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-400/35'
      : 'bg-[#f3f0e8] text-zinc-700 border-zinc-400/40 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600';
  return (
    <span className={`inline-flex items-center rounded-[4px] px-1.5 py-0.5 font-mono text-[10.5px] font-bold tabular-nums border ${tone}`}>
      {isRatio ? labels.pct(value) : labels.signedPct(value)}
    </span>
  );
}

function HistoryChart({ item, selectedYear, theme, labels, onSelectYear }) {
  const { t, number } = labels;
  const [hoverIdx, setHoverIdx] = useState(null);
  const years = kindOf(item) === 'station' ? YEARS.slice(0, -1) : YEARS;
  const series = years.map((yr, idx) => ({ year: yr, value: item.values?.[idx] ?? null }));
  if (series.filter(d => d.value !== null).length < 2) return null;

  const width = 296;
  const baseline = 88;
  const chartHeight = 62;
  const top = Math.max(1, ...series.map(d => d.value ?? 0));
  const step = width / series.length;
  const base2019 = series[1]?.value ?? null;
  const refY = base2019 && base2019 > 0 ? baseline - (base2019 / top) * chartHeight : null;

  const activeEntry = hoverIdx !== null
    ? series[hoverIdx]
    : series.find(d => d.year === selectedYear) ?? series.findLast(d => d.value !== null);

  const summary = series
    .map(d => d.value == null ? null : t('fiscal', { year: d.year }) + ' ' + number(d.value))
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mt-3 rounded-lg bg-[#fffef9] dark:bg-[#181c24] p-3.5 border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-sm dark:shadow-brutal-dark-sm">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 dark:text-slate-300">
          {t('history')}
        </h3>
        {activeEntry && (
          <span className="font-mono text-[11px] font-bold tabular-nums text-[#18191b] dark:text-[#ffd25a]">
            {t('fiscal', { year: activeEntry.year })} · {activeEntry.value == null ? t('noData') : number(activeEntry.value)}
          </span>
        )}
      </div>
      <svg className="w-full h-[110px] block select-none" role="img" aria-label={summary} viewBox={`0 0 ${width} 110`}>
        {refY !== null && (
          <line
            x1="4"
            x2={width - 4}
            y1={refY}
            y2={refY}
            stroke="currentColor"
            strokeDasharray="3 3"
            className="text-zinc-400 dark:text-slate-500"
            strokeWidth="1"
          />
        )}
        <line
          x1="4"
          x2={width - 4}
          y1={baseline}
          y2={baseline}
          stroke="currentColor"
          className="text-[#1e2022]/35 dark:text-slate-600"
          strokeWidth="1.2"
        />
        {series.map(({ year, value }, index) => {
          const barW = Math.max(14, step - 10);
          const x = step * index + (step - barW) / 2;
          const height = value == null ? 0 : Math.max(3, (value / top) * chartHeight);
          const isCurrent = selectedYear === year;
          const isHovered = hoverIdx === index;
          const fill = isCurrent
            ? flowColor(value, theme)
            : isHovered
              ? '#ffd25a'
              : (theme === 'dark' ? '#2c3342' : '#e2ddd1');
          return (
            <g
              key={year}
              className={value != null ? 'cursor-pointer' : ''}
              onMouseEnter={() => setHoverIdx(index)}
              onMouseLeave={() => setHoverIdx(null)}
              onClick={() => value != null && onSelectYear(year)}
            >
              <title>{t('fiscal', { year })} · {value == null ? t('noData') : number(value)}</title>
              <rect x={step * index} y="6" width={step} height={baseline + 18} fill="transparent" />
              {value != null && (
                <rect
                  x={x}
                  y={baseline - height}
                  width={barW}
                  height={height}
                  rx="2.5"
                  fill={fill}
                  stroke={isCurrent || isHovered ? (theme === 'dark' ? '#f8fafc' : '#18191b') : 'none'}
                  strokeWidth="1.25"
                  className="transition-all duration-120"
                />
              )}
              <text
                x={x + barW / 2}
                y="103"
                textAnchor="middle"
                className={`font-mono text-[10px] fill-current ${
                  isCurrent
                    ? 'font-extrabold text-[#18191b] dark:text-[#ffd25a]'
                    : 'font-semibold text-zinc-500 dark:text-slate-400'
                }`}
              >
                {"'" + String(year).slice(-2)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-[11px] text-zinc-500 dark:text-slate-400">
        {t('historyHint')}
      </p>
    </div>
  );
}

function sourceIndex(item, year) {
  if (kindOf(item) === 'station') return 3;
  if (isCensus(item)) return 2;
  return item.official && year === 2024 ? 1 : 0;
}

function SiblingBreakdown({ siblings, item, station, view, theme, labels, onSelect, onHoverItem }) {
  const { t, name, number } = labels;
  if (siblings.length <= 1) return null;

  const rows = siblings.map(sib => {
    const reading = readingInView(sib, view);
    const label = station
      ? [name(sib.operator), name(sib.line)].filter(Boolean).join(' · ')
      : scopeOf(sib, name) || name(sib.name);
    return { sib, value: reading.value, year: reading.year, label };
  });

  if (station) {
    rows.sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  }

  const maxVal = Math.max(1, ...rows.map(r => r.value ?? 0));

  return (
    <div className="mt-3 rounded-lg bg-[#fffef9] dark:bg-[#181c24] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-sm dark:shadow-brutal-dark-sm overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2 border-b-[1.5px] border-[#1e2022] dark:border-[#3c4352] bg-[#f3f0e8] dark:bg-[#222733]">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-800 dark:text-slate-200">
          {t(station ? 'operatorRecord' : 'section')}
        </h3>
        <span className="rounded-[4px] bg-[#fffef9] dark:bg-[#181c24] border border-[#1e2022]/40 dark:border-slate-600 px-1.5 py-0.2 font-mono text-[10.5px] font-bold text-zinc-700 dark:text-slate-300 tabular-nums">
          {rows.length}
        </span>
      </div>
      <div className="max-h-56 overflow-y-auto thin-scroll divide-y divide-[#1e2022]/12 dark:divide-white/10">
        {rows.map(({ sib, value, year: sibYear, label }) => {
          const active = sib.id === item.id;
          const pct = value != null ? Math.max(4, (value / maxVal) * 100) : 0;
          const showDiffYear = view.years[station ? 'stations' : 'lines'] === 'latest' && sibYear && sibYear !== readingInView(item, view).year;
          return (
            <button
              key={sib.id}
              type="button"
              onClick={() => onSelect(sib.id)}
              onMouseEnter={() => onHoverItem(sib)}
              onMouseLeave={() => onHoverItem(null)}
              className={`w-full text-left px-3.5 py-2.5 transition-colors flex flex-col gap-1.5 ${
                active
                  ? 'bg-[#ffd25a]/35 dark:bg-[#ffd25a]/15'
                  : 'hover:bg-[#f3f0e8] dark:hover:bg-[#222733]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs truncate ${
                  active ? 'font-extrabold text-[#18191b] dark:text-[#ffd25a]' : 'font-semibold text-zinc-700 dark:text-slate-200'
                }`}>
                  {label}
                </span>
                <span className={`font-mono text-xs tabular-nums shrink-0 ${
                  active ? 'font-extrabold text-[#18191b] dark:text-[#ffd25a]' : 'font-bold text-zinc-700 dark:text-slate-300'
                }`}>
                  {showDiffYear && <span className="text-[10px] font-medium text-zinc-400 mr-1">{"'" + String(sibYear).slice(-2)}</span>}
                  {value == null ? t('noData') : number(value)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-[2px] bg-[#ebe6da] dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-[2px] transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: flowColor(value, theme) }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ labels, theme, item, siblings, view, onSelect, onFilter, onHoverItem, onBack, onLocate }) {
  const { t, name, number } = labels;
  const station = kindOf(item) === 'station';
  const { year, value, yoy, vs2019, dailyPkm } = readingInView(item, view);
  const [metric, unit] = measureOf(item);
  const scope = scopeOf(item, name);
  const period = isCensus(item) ? t('period') : year ? t('fiscal', { year }) : '';
  const distance = item.km ? number(item.km) + ' km' + (isCensus(item) ? ' (' + t('estimatedLength') + ')' : '') : '';
  const details = [period, distance].filter(Boolean).join(' · ');
  const note = station ? item.notes?.[year] : item.note;
  const swatch = itemColor(item, theme, view.colorMode);

  const hubSum = station && siblings.length > 1
    ? siblings.reduce((acc, sib) => acc + (readingInView(sib, view).value ?? 0), 0)
    : null;

  return (
    <article className="p-3.5 pb-6">
      {/* Top navigation & locate action */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="brutal-btn inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-bold text-[#18191b] dark:text-slate-100 bg-[#fffef9] dark:bg-[#181c24] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-xs dark:shadow-brutal-dark-sm hover:bg-[#ebe6da] dark:hover:bg-[#232834]"
        >
          <Icon name="arrowLeft" className="w-3.5 h-3.5" />
          <span>{t('back')}</span>
        </button>
        <button
          type="button"
          onClick={() => onLocate(item)}
          className="brutal-btn inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-bold bg-[#ffd25a] text-[#18191b] border-[1.5px] border-[#18191b] shadow-brutal-xs hover:bg-[#ffc836]"
        >
          <Icon name="locate" className="w-3.5 h-3.5" />
          <span>{t('locate')}</span>
        </button>
      </div>

      {/* Main Header + Hero Metric Card */}
      <div className="rounded-lg bg-[#fffef9] dark:bg-[#181c24] p-4 border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-sm dark:shadow-brutal-dark-sm">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {!station && item.type && (
            <span className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[11px] font-bold border ${CATEGORY_BADGE[item.type]}`}>
              <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[item.type]}`} />
              {t(item.type)}
            </span>
          )}
          {station && item.line && (
            <span className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-bold bg-[#f3f0e8] text-zinc-800 border border-[#1e2022]/25 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              {name(item.line)}
            </span>
          )}
          {!station && item.official && year === 2024 && (
            <span className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-500/40 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-400/40">
              {t('officialBadge')}
            </span>
          )}
        </div>

        <h2 className="text-xl font-extrabold tracking-tight text-[#18191b] dark:text-white leading-snug break-words">
          {name(item.name)}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-600 dark:text-slate-300">
          <button
            type="button"
            title={t('filterOperator')}
            onClick={() => onFilter({ operator: view.operator === item.operator ? null : item.operator })}
            className={`brutal-btn inline-flex items-center gap-1 rounded-[5px] px-2.5 py-0.5 font-bold border ${
              view.operator === item.operator
                ? 'bg-[#18191b] text-[#fffef9] border-[#18191b] dark:bg-[#ffd25a] dark:text-[#18191b] dark:border-[#ffd25a]'
                : 'bg-[#f3f0e8] hover:bg-[#ffd25a] text-[#18191b] border-[#1e2022]/40 dark:bg-[#222733] dark:text-slate-200 dark:border-slate-600 dark:hover:border-[#ffd25a]'
            }`}
          >
            <Icon name="filter" className="w-3 h-3" />
            <span>{name(item.operator)}</span>
          </button>
          {scope && <span className="text-zinc-500 dark:text-slate-400 font-semibold">· {scope}</span>}
        </div>

        {/* Hero Figure Box */}
        <div className="mt-3.5 rounded-[6px] bg-[#f3f0e8] dark:bg-[#11141b] border border-[#1e2022]/25 dark:border-slate-700/80 p-3.5 relative overflow-hidden">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 bottom-0 w-2"
            style={{ backgroundColor: swatch }}
          />
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-slate-400 pl-2">
            {t(metric)}
          </p>
          <div className="mt-1 pl-2 flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
            <strong className="font-mono text-[27px] font-extrabold tracking-tight tabular-nums text-[#18191b] dark:text-white leading-none">
              {value == null ? t('noData') : number(value)}
            </strong>
            {value != null && (
              <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                {t(unit)}
              </span>
            )}
          </div>
          {details && (
            <p className="mt-1.5 pl-2 font-mono text-[11px] font-semibold text-zinc-500 dark:text-slate-400">
              {details}
            </p>
          )}
        </div>

        {/* Secondary Derived KPI Grid */}
        {(yoy != null || vs2019 != null || dailyPkm != null || (hubSum != null && hubSum > 0)) && (
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {yoy != null && (
              <div className="rounded-[6px] bg-[#f3f0e8]/75 dark:bg-[#11141b] border border-[#1e2022]/15 dark:border-slate-800 p-2.5">
                <div className="text-[10.5px] font-bold text-zinc-500 dark:text-slate-400">{t('yoyLabel')}</div>
                <div className="mt-1">
                  <TrendBadge value={yoy} labels={labels} />
                </div>
              </div>
            )}
            {vs2019 != null && (
              <div className="rounded-[6px] bg-[#f3f0e8]/75 dark:bg-[#11141b] border border-[#1e2022]/15 dark:border-slate-800 p-2.5">
                <div className="text-[10.5px] font-bold text-zinc-500 dark:text-slate-400">{t('vs2019Label')}</div>
                <div className="mt-1">
                  <TrendBadge value={vs2019} isRatio labels={labels} />
                </div>
              </div>
            )}
            {dailyPkm != null && (
              <div className="col-span-2 rounded-[6px] bg-[#f3f0e8]/75 dark:bg-[#11141b] border border-[#1e2022]/15 dark:border-slate-800 p-2.5 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-zinc-600 dark:text-slate-400">{t('dailyPkm')}</span>
                <span className="font-mono text-xs font-extrabold tabular-nums text-[#18191b] dark:text-slate-100">
                  {number(dailyPkm)} <span className="font-sans font-medium text-zinc-500 dark:text-slate-400">{t('pkmUnit')}</span>
                </span>
              </div>
            )}
            {hubSum != null && hubSum > 0 && (
              <div className="col-span-2 rounded-[6px] bg-[#f3f0e8]/75 dark:bg-[#11141b] border border-[#1e2022]/15 dark:border-slate-800 p-2.5 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-zinc-800 dark:text-slate-200">{t('hubTotal')}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-slate-500">{t('hubHint')}</div>
                </div>
                <span className="font-mono text-sm font-extrabold tabular-nums text-[#18191b] dark:text-white">
                  {number(hubSum)} <span className="font-sans text-[11px] font-normal text-zinc-500">{t('stationUnit')}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Fiscal Year Bar Chart */}
      <HistoryChart
        item={item}
        selectedYear={year}
        theme={theme}
        labels={labels}
        onSelectYear={yr => onFilter({ year: String(yr) })}
      />

      {/* Multi-segment or Multi-operator Hub Breakdown */}
      <SiblingBreakdown
        siblings={siblings}
        item={item}
        station={station}
        view={view}
        theme={theme}
        labels={labels}
        onSelect={onSelect}
        onHoverItem={onHoverItem}
      />

      {/* Scope / Official Remark Callout */}
      {note && (
        <div className="mt-3 rounded-lg bg-[#fff8dc] dark:bg-amber-950/40 border-[1.5px] border-[#1e2022] dark:border-amber-700/60 px-3.5 py-2.5 shadow-brutal-xs">
          <div className="text-[11px] font-extrabold text-amber-950 dark:text-amber-300 mb-0.5">{t('scopeNote')}</div>
          <p className="text-xs font-medium text-amber-900 dark:text-amber-200/90 leading-relaxed" lang="ja">{note}</p>
        </div>
      )}

      {/* Source Link */}
      <div className="mt-4 px-1">
        <a
          href={sources[sourceIndex(item, year)]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#18191b] dark:text-[#ffd25a] underline decoration-[1.5px] underline-offset-4 hover:text-[#d81b52]"
        >
          <span>{t('source')}</span>
          <Icon name="external" className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}

function Results({
  labels, theme, view, items, summary, count, searching, stationMode, censusMode,
  onSelect, onHoverItem, onPreviewBand, onFilter, onMore,
}) {
  const { t, name, number, pct, language } = labels;
  const heading = searching ? 'results' : stationMode ? 'stationRanking' : 'lineRanking';
  const hint = searching ? t('matches', { n: number(items.length) }) : t(stationMode ? 'stationByOperator' : 'peak');
  const topValue = Math.max(1, ...(items.slice(0, count).map(i => i.value ?? 0)));
  const bandLabels = language === 'en' ? BAND_LABELS_EN : BAND_LABELS_ZH;

  return (
    <div className="p-3 space-y-3 pb-5">
      {/* Soft Neo-Brutalist Macro Summary + 7-Tier Distribution Card */}
      {!searching && summary && (
        <div className="rounded-lg bg-[#fffef9] dark:bg-[#181c24] p-3 border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-sm dark:shadow-brutal-dark-sm">
          <div className="grid grid-cols-3 gap-1.5">
            <div className="px-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-slate-400">{t('summaryCount')}</div>
              <div className="mt-0.5 font-mono text-sm font-extrabold tabular-nums text-[#18191b] dark:text-white">{number(summary.count)}</div>
            </div>
            <div className="px-2 border-l border-[#1e2022]/15 dark:border-white/10">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-slate-400">{t('summaryMedian')}</div>
              <div className="mt-0.5 font-mono text-sm font-extrabold tabular-nums text-[#18191b] dark:text-white">{number(summary.median)}</div>
            </div>
            <div className="px-2 border-l border-[#1e2022]/15 dark:border-white/10">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-slate-400">{t('summaryRecovery')}</div>
              <div className="mt-0.5 font-mono text-sm font-extrabold tabular-nums text-[#0d9448] dark:text-emerald-400">
                {summary.medianRecovery != null ? pct(summary.medianRecovery) : '—'}
              </div>
            </div>
          </div>

          {/* Interactive 7-Band Structural Distribution Stacked Bar */}
          {summary.bands && summary.count > 0 && (
            <div className="mt-2.5 pt-2 border-t border-[#1e2022]/12 dark:border-white/10">
              <div className="h-2.5 w-full rounded-[3px] border border-[#1e2022]/50 dark:border-slate-600 overflow-hidden flex bg-[#f3f0e8] dark:bg-slate-800">
                {summary.bands.map((bCount, idx) => {
                  if (!bCount) return null;
                  const share = (bCount / summary.count) * 100;
                  const isLocked = view.band === idx;
                  const dimmed = view.band !== null && !isLocked;
                  return (
                    <button
                      key={idx}
                      type="button"
                      title={`${bandLabels[idx]}: ${number(bCount)}`}
                      onMouseEnter={() => onPreviewBand?.(idx)}
                      onMouseLeave={() => onPreviewBand?.(null)}
                      onClick={() => onFilter({ band: isLocked ? null : idx, colorMode: 'flow' })}
                      style={{
                        width: `${Math.max(3, share)}%`,
                        backgroundColor: flowColor(BAND_SAMPLES[idx], theme),
                      }}
                      className={`h-full border-r last:border-r-0 border-[#18191b]/30 transition-opacity ${
                        dimmed ? 'opacity-20 hover:opacity-80' : 'opacity-95 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Neo-Brutalist Ranking List Card */}
      <div className="rounded-lg bg-[#fffef9] dark:bg-[#181c24] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-sm dark:shadow-brutal-dark-sm overflow-hidden">
        <div className="px-3.5 pt-2.5 pb-2 border-b-[1.5px] border-[#1e2022] dark:border-[#3c4352] bg-[#f8f5ee] dark:bg-[#202531]">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-extrabold tracking-tight text-[#18191b] dark:text-slate-100">{t(heading)}</h2>
            <small className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-slate-400 whitespace-nowrap">{hint}</small>
          </div>
          {!searching && !censusMode && items.length > 1 && (
            <div className="mt-2 flex items-center gap-1">
              {['volume', 'recovery', 'yoy'].map(sortKey => {
                const active = view.sort === sortKey;
                return (
                  <button
                    key={sortKey}
                    type="button"
                    onClick={() => onFilter({ sort: sortKey })}
                    className={`rounded-[4px] px-2 py-0.5 text-[11px] font-bold border transition-all ${
                      active
                        ? 'bg-[#18191b] text-[#fffef9] border-[#18191b] dark:bg-[#ffd25a] dark:text-[#18191b] dark:border-[#ffd25a]'
                        : 'border-transparent text-zinc-600 hover:bg-[#ebe6da] dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t(sortKey === 'volume' ? 'sortVolume' : sortKey === 'recovery' ? 'sortRecovery' : 'sortYoy')}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {items.length ? (
          <ul className="divide-y divide-[#1e2022]/12 dark:divide-white/10">
            {items.slice(0, count).map((item, idx) => {
              const isItemStation = kindOf(item) === 'station';
              const swatch = itemColor(item, theme, view.colorMode);
              const barWidth = view.sort === 'volume' && item.value != null
                ? Math.max(5, Math.min(100, (item.value / topValue) * 100))
                : 0;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    onMouseEnter={() => onHoverItem(item)}
                    onMouseLeave={() => onHoverItem(null)}
                    className="group w-full text-left px-3 py-2.5 transition-colors hover:bg-[#ffd25a]/22 dark:hover:bg-[#252b38] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18191b] grid grid-cols-[24px_5px_minmax(0,1fr)_auto] items-center gap-2.5"
                  >
                    <span className={`font-mono text-[11px] font-extrabold tabular-nums text-center rounded-[3px] py-0.5 ${
                      idx < 3 && !searching
                        ? 'bg-[#ffd25a] text-[#18191b] border border-[#18191b]/50'
                        : 'text-zinc-400 dark:text-slate-500'
                    }`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-8 w-[5px] rounded-[2px] border border-[#18191b]/25 dark:border-black/40 transition-transform group-hover:scale-y-108"
                      style={{ backgroundColor: swatch }}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        {!isItemStation && item.type && (
                          <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOT[item.type]}`} />
                        )}
                        <span className="text-[13.5px] font-bold text-[#18191b] dark:text-slate-100 truncate">
                          {name(item.name)}
                        </span>
                      </span>
                      <span className="block text-[11.5px] font-medium text-zinc-500 dark:text-slate-400 truncate mt-0.5">
                        {[name(item.operator), scopeOf(item, name) || (isItemStation && name(item.line))].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-mono text-[13px] font-extrabold tabular-nums text-[#18191b] dark:text-slate-100">
                        {item.value == null ? '–' : number(item.value)}
                      </span>
                      {view.sort === 'recovery' && item.vs2019 != null ? (
                        <TrendBadge value={item.vs2019} isRatio labels={labels} />
                      ) : view.sort === 'yoy' && item.yoy != null ? (
                        <TrendBadge value={item.yoy} labels={labels} />
                      ) : item.vs2019 != null && !censusMode ? (
                        <span className="font-mono text-[10px] font-semibold tabular-nums text-zinc-500 dark:text-slate-500">
                          {pct(item.vs2019)} vs’19
                        </span>
                      ) : barWidth > 0 ? (
                        <span className="w-12 h-1.5 rounded-[2px] bg-[#ebe6da] dark:bg-slate-800 overflow-hidden block">
                          <span className="block h-full" style={{ width: `${barWidth}%`, backgroundColor: swatch }} />
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mx-5 my-8 text-sm text-center text-zinc-500 dark:text-slate-400 leading-relaxed">
            {t(searching ? 'noMatches' : 'noYear')}
          </p>
        )}
      </div>

      {items.length > count && (
        <button
          type="button"
          onClick={onMore}
          className="brutal-btn mx-auto mt-1 block rounded-[6px] bg-[#fffef9] dark:bg-[#181c24] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] px-5 py-2 text-xs font-extrabold text-[#18191b] dark:text-[#ffd25a] hover:bg-[#ffd25a] dark:hover:bg-[#252b38] shadow-brutal-xs dark:shadow-brutal-dark-sm"
        >
          {t('more')}
        </button>
      )}
    </div>
  );
}

export default function RailPanel({
  labels, theme, view, results, summary, record, siblings, status, searchRef, panelRef,
  onQuery, onFilter, onSelect, onHoverItem, onPreviewBand, onBack, onLocate, onMore, onRetry,
}) {
  const { t, name, language } = labels;
  const stationMode = view.layer === 'stations';
  const censusMode = !stationMode && view.mode === 'census';
  const years = stationMode ? YEARS.slice(0, -1) : YEARS;
  const activeYearValue = view.years[view.layer];
  const bandLabels = language === 'en' ? BAND_LABELS_EN : BAND_LABELS_ZH;
  const hasExtraFilters = view.operator !== null || view.band !== null;

  const scrollKey = [
    view.region, view.layer, view.mode, view.category, view.operator, view.band, view.sort, view.query, activeYearValue, record?.id,
  ].join('|');
  const content = useRef(null);

  useLayoutEffect(() => {
    if (content.current) content.current.scrollTop = 0;
  }, [scrollKey]);

  function submit(event) {
    event.preventDefault();
    if (!record && results.length) onSelect(results[0].id);
  }

  return (
    <aside
      ref={panelRef}
      aria-labelledby="explore-title"
      className="flex flex-col min-h-0 min-w-0 bg-[#f3f0e8] dark:bg-[#111317] border-t-[1.5px] md:border-t-0 md:border-r-[1.5px] border-[#1e2022] dark:border-[#323846] z-20"
    >
      {/* Soft Neo-Brutalist Control Deck */}
      <div className="bg-[#fffef9] dark:bg-[#161920] px-4 pt-4 pb-3.5 border-b-[1.5px] border-[#1e2022] dark:border-[#323846] space-y-2.5">
        <div>
          <h1 id="explore-title" className="text-lg font-extrabold tracking-tight text-[#18191b] dark:text-white">
            {t('explore')}
          </h1>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-slate-400 leading-relaxed">
            {t('intro')}
          </p>
        </div>

        {/* Crisp Framed Search Box */}
        <form
          role="search"
          onSubmit={submit}
          className="h-10.5 flex items-center gap-2.5 rounded-[6px] bg-[#f7f5ee] dark:bg-[#111317] px-3 text-zinc-600 dark:text-slate-400 border-[1.5px] border-[#1e2022] dark:border-[#3c4352] shadow-brutal-xs dark:shadow-brutal-dark-sm focus-within:bg-white dark:focus-within:bg-[#1c2029] focus-within:ring-2 focus-within:ring-[#ffd25a] transition-all"
        >
          <Icon name="search" className="w-4 h-4 text-[#18191b] dark:text-slate-300" />
          <label className="sr-only" htmlFor="search">{t('search')}</label>
          <input
            id="search"
            ref={searchRef}
            type="search"
            autoComplete="off"
            value={view.query}
            placeholder={t('search')}
            onChange={event => onQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent border-0 outline-none text-[13px] font-medium text-[#18191b] dark:text-slate-100 placeholder:text-zinc-500 dark:placeholder:text-slate-500"
          />
          {view.query ? (
            <button
              type="button"
              aria-label={t('clear')}
              onClick={() => {
                onQuery('');
                searchRef.current.focus();
              }}
              className="w-6 h-6 rounded-[4px] grid place-items-center text-zinc-600 hover:bg-[#ebe6da] dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <Icon name="close" className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#fffef9] dark:bg-[#222733] text-[#18191b] dark:text-slate-300 border border-[#1e2022]/50 dark:border-slate-600">
              /
            </kbd>
          )}
        </form>

        {/* Segmented Layer Control: Lines vs Stations */}
        <div
          aria-label={t('layerLabel')}
          className="grid grid-cols-2 rounded-[6px] border-[1.5px] border-[#1e2022] dark:border-[#3c4352] overflow-hidden bg-[#f3f0e8] dark:bg-[#111317] p-0.5 gap-0.5"
        >
          {['lines', 'stations'].map(layer => {
            const pressed = view.layer === layer;
            return (
              <button
                key={layer}
                type="button"
                aria-pressed={pressed}
                onClick={() => onFilter({ layer })}
                className={`inline-flex items-center justify-center gap-1.5 rounded-[4px] h-8 text-xs font-extrabold transition-all ${
                  pressed
                    ? 'bg-[#ffd25a] text-[#18191b] border border-[#18191b]'
                    : 'text-zinc-600 dark:text-slate-400 hover:text-[#18191b] dark:hover:text-white'
                }`}
              >
                <Icon name={layer} className="w-3.5 h-3.5" />
                <span>{t(layer === 'lines' ? 'lineLayer' : 'stationLayer')}</span>
              </button>
            );
          })}
        </div>

        {/* Dataset Mode Switch */}
        {!stationMode && (
          <div className="grid grid-cols-2 gap-1 rounded-[6px] bg-[#f3f0e8] dark:bg-[#111317] border border-[#1e2022]/25 dark:border-[#323846] p-0.5">
            {['national', 'census'].map(mode => {
              const active = view.mode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onFilter({ mode })}
                  className={`rounded-[4px] py-1.5 px-2 text-xs font-bold transition-all truncate ${
                    active
                      ? 'bg-[#18191b] text-[#fffef9] dark:bg-[#2a3140] dark:text-white'
                      : 'text-zinc-600 dark:text-slate-400 hover:text-[#18191b] dark:hover:text-slate-200'
                  }`}
                >
                  {t(mode)}
                </button>
              );
            })}
          </div>
        )}

        {/* Tactile Fiscal Year Strip */}
        {!censusMode && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-zinc-600 dark:text-slate-400">{t('year')}</span>
              <span className="font-mono text-[11px] font-bold text-[#18191b] dark:text-[#ffd25a]">
                {activeYearValue === 'latest' ? t('latestFull') : t('fiscal', { year: activeYearValue })}
              </span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {['latest', ...years.slice().reverse()].map(yr => {
                const valueStr = String(yr);
                const selected = String(activeYearValue) === valueStr;
                return (
                  <button
                    key={valueStr}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onFilter({ year: valueStr })}
                    className={`brutal-btn shrink-0 rounded-[5px] px-2 py-1 font-mono text-[11px] font-bold tabular-nums border ${
                      selected
                        ? 'bg-[#18191b] text-[#fffef9] border-[#18191b] dark:bg-[#ffd25a] dark:text-[#18191b] dark:border-[#ffd25a]'
                        : 'bg-[#fffef9] dark:bg-[#1e232e] text-zinc-700 dark:text-slate-300 border-[#1e2022]/30 dark:border-slate-700 hover:border-[#1e2022]'
                    }`}
                  >
                    {yr === 'latest' ? t('latest') : "'" + String(yr).slice(-2)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rail Category Filter Chips */}
        {!stationMode && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {CATEGORIES.map(cat => {
              const selected = view.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onFilter({ category: cat })}
                  className={`brutal-btn inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs font-bold border ${
                    selected
                      ? 'bg-[#ffd25a] text-[#18191b] border-[#18191b] shadow-brutal-xs'
                      : 'bg-[#fffef9] dark:bg-[#1e232e] text-zinc-700 dark:text-slate-300 border-[#1e2022]/30 dark:border-slate-700 hover:bg-[#f3f0e8] dark:hover:bg-slate-800'
                  }`}
                >
                  {cat !== 'all' && (
                    <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[cat]}`} />
                  )}
                  <span>{t(cat)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Sub-Filter Chips */}
        {hasExtraFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {view.operator && (
              <button
                type="button"
                onClick={() => onFilter({ operator: null })}
                className="inline-flex items-center gap-1 rounded-[5px] bg-[#18191b] text-[#fffef9] dark:bg-[#ffd25a] dark:text-[#18191b] px-2.5 py-0.5 text-[11px] font-bold"
              >
                <span>{t('activeOperator', { name: name(view.operator) })}</span>
                <Icon name="close" className="w-3 h-3" />
              </button>
            )}
            {view.band !== null && (
              <button
                type="button"
                onClick={() => onFilter({ band: null })}
                className="inline-flex items-center gap-1 rounded-[5px] bg-[#18191b] text-[#fffef9] dark:bg-[#ffd25a] dark:text-[#18191b] px-2.5 py-0.5 text-[11px] font-bold"
              >
                <span>{t('activeBand', { band: bandLabels[view.band] })}</span>
                <Icon name="close" className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Results or Detail Inspector */}
      <div
        ref={content}
        aria-live="polite"
        className="flex-1 min-h-[120px] max-h-[62svh] md:max-h-none overflow-y-auto thin-scroll"
      >
        {status === 'loading' && (
          <div className="p-4 space-y-3 animate-pulse">
            <div className="h-16 rounded-lg bg-white/80 dark:bg-slate-800 border border-[#1e2022]/20" />
            <div className="h-64 rounded-lg bg-white/80 dark:bg-slate-800/70 border border-[#1e2022]/20" />
            <p className="text-xs font-semibold text-center text-zinc-500 dark:text-slate-400 pt-1">{t('loading')}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="p-6 text-center">
            <p className="text-sm font-semibold text-zinc-700 dark:text-slate-300 mb-3">{t('loadError')}</p>
            <button
              type="button"
              onClick={onRetry}
              className="brutal-btn rounded-[6px] bg-[#ffd25a] text-[#18191b] border-[1.5px] border-[#18191b] shadow-brutal-sm px-4 py-2 text-xs font-extrabold"
            >
              {t('retry')}
            </button>
          </div>
        )}
        {status === 'ready' && (record ? (
          <Detail
            labels={labels}
            theme={theme}
            view={view}
            item={record}
            siblings={siblings}
            onSelect={onSelect}
            onFilter={onFilter}
            onHoverItem={onHoverItem}
            onBack={onBack}
            onLocate={onLocate}
          />
        ) : (
          <Results
            labels={labels}
            theme={theme}
            view={view}
            items={results}
            summary={summary}
            count={view.limit}
            searching={!!view.query.trim()}
            stationMode={stationMode}
            censusMode={censusMode}
            onSelect={onSelect}
            onHoverItem={onHoverItem}
            onPreviewBand={onPreviewBand}
            onFilter={onFilter}
            onMore={onMore}
          />
        ))}
      </div>

      {/* Footer Metadata */}
      <footer className="min-h-[38px] bg-[#fffef9] dark:bg-[#161920] text-zinc-600 dark:text-slate-400 border-t-[1.5px] border-[#1e2022] dark:border-[#323846] flex items-center gap-2 px-4 py-2 font-mono text-[11px] font-semibold">
        <Icon name="clock" className="w-3.5 h-3.5 shrink-0 text-[#18191b] dark:text-[#ffd25a]" />
        <span className="truncate">{t(stationMode ? 'stationYears' : censusMode ? 'censusRegion' : 'dataYears')}</span>
      </footer>
    </aside>
  );
}
