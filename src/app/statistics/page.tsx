"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Statistics } from "@/app/libs/statistics";

// Chart colours (validated categorical order, light mode). Identity follows the entity, never its rank.
const PHOTOS_COLOR = "#2a78d6";
const PRINTS_COLOR = "#eb6834";
const BACKGROUND_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
const GRID_COLOR = "#e1e0d9";
const AXIS_COLOR = "#c3c2b7";
const MUTED_INK = "#898781";
const SECONDARY_INK = "#52514e";

interface DayRow {
    day: string;
    label: string;
    longLabel: string;
    dateLabel: string;
    photos: number;
    prints: number;
    backgrounds: Record<string, number>;
}

interface TooltipState {
    x: number;
    y: number;
    content: ReactNode;
}

type ShowTooltip = (event: React.MouseEvent, content: ReactNode) => void;

const shortDate = new Intl.DateTimeFormat("de-CH", { weekday: "short", day: "2-digit", month: "2-digit" });
const longDate = new Intl.DateTimeFormat("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const dayMonth = new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "2-digit" });
const percent = new Intl.NumberFormat("de-CH", { style: "percent", maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("de-CH", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function parseDay(day: string) {
    return new Date(`${day}T12:00:00`);
}

// Round an axis maximum up to 1/2/5 × 10^n so ticks land on readable numbers
function niceScale(max: number, tickCount = 4) {
    if (max <= 0) return { max: 1, ticks: [0, 1] };
    const rough = max / tickCount;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
    const niceMax = Math.ceil(max / step) * step;
    const ticks = [];
    for (let t = 0; t <= niceMax + step / 2; t += step) ticks.push(Number(t.toFixed(10)));
    return { max: niceMax, ticks };
}

// Bar with 4px rounded data-end and a square baseline
function barPath(x: number, y: number, width: number, height: number, direction: "up" | "right" = "up") {
    if (height <= 0 || width <= 0) return "";
    if (direction === "up") {
        const r = Math.min(4, width / 2, height);
        return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`;
    }
    const r = Math.min(4, height / 2, width);
    return `M${x},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height - r}Q${x + width},${y + height} ${x + width - r},${y + height}H${x}Z`;
}

export default function StatisticsPage() {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = () =>
            fetch("/api/statistics", { cache: "no-store" })
                .then((response) => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.json();
                })
                .then((data: Statistics) => {
                    if (cancelled) return;
                    setStatistics(data);
                    setError(null);
                    setLastUpdated(new Date());
                })
                .catch((err) => !cancelled && setError(String(err?.message ?? err)));
        load();
        const interval = setInterval(load, 30_000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    const rows = useMemo<DayRow[]>(() => {
        if (!statistics) return [];
        return Object.entries(statistics.days)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, daily]) => ({
                day,
                label: shortDate.format(parseDay(day)),
                longLabel: longDate.format(parseDay(day)),
                dateLabel: dayMonth.format(parseDay(day)),
                photos: daily.totalResults,
                prints: daily.totalPrints,
                backgrounds: daily.backgrounds,
            }));
    }, [statistics]);

    const backgroundNames = useMemo(() => {
        const names = new Set<string>();
        rows.forEach((row) => Object.keys(row.backgrounds).forEach((name) => names.add(name)));
        return [...names].sort();
    }, [rows]);

    const showTooltip: ShowTooltip = (event, content) => setTooltip({ x: event.clientX, y: event.clientY, content });
    const hideTooltip = () => setTooltip(null);

    return (
        <main className="min-h-screen bg-srf-wg-25 text-srf-gs-900 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm text-srf-r-700 tracking-wide uppercase">SRF Selfie AI</p>
                        <h1 className="text-3xl sm:text-4xl">Statistics</h1>
                    </div>
                    {lastUpdated && (
                        <p className="font-regular text-sm text-srf-gs-800">
                            Updated {lastUpdated.toLocaleTimeString("de-CH")} · refreshes every 30s
                        </p>
                    )}
                </header>

                {error && !statistics && (
                    <p className="rounded-lg bg-white p-6 font-regular text-srf-r-700 shadow-sm">Could not load statistics: {error}</p>
                )}
                {!error && !statistics && <p className="font-regular text-srf-gs-800">Loading…</p>}
                {statistics && rows.length === 0 && (
                    <p className="rounded-lg bg-white p-6 font-regular shadow-sm">No statistics recorded yet.</p>
                )}

                {rows.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <KpiRow rows={rows} backgroundNames={backgroundNames} />

                        <Card title="Photos vs. prints per day" subtitle="Generated selfies compared to printouts">
                            <Legend items={[{ label: "Photos", color: PHOTOS_COLOR }, { label: "Prints", color: PRINTS_COLOR }]} />
                            <div className="overflow-x-auto">
                                <PhotosVsPrintsChart rows={rows} showTooltip={showTooltip} hideTooltip={hideTooltip} />
                            </div>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card title="Prints per photo" subtitle="Above 1.0 means people printed more than one copy on average">
                                <PrintRatioChart rows={rows} showTooltip={showTooltip} hideTooltip={hideTooltip} />
                            </Card>
                            <Card title="Cumulative total" subtitle="Running total over all recorded days">
                                <Legend items={[{ label: "Photos", color: PHOTOS_COLOR }, { label: "Prints", color: PRINTS_COLOR }]} />
                                <CumulativeChart rows={rows} showTooltip={showTooltip} hideTooltip={hideTooltip} />
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card title="Most popular backgrounds" subtitle="All photos, all days">
                                <BackgroundTotalsChart rows={rows} backgroundNames={backgroundNames} showTooltip={showTooltip} hideTooltip={hideTooltip} />
                            </Card>
                            <Card title="Background mix per day" subtitle="Share of each background in that day's photos">
                                <Legend items={backgroundNames.map((name, i) => ({ label: name, color: BACKGROUND_COLORS[i % BACKGROUND_COLORS.length] }))} />
                                <BackgroundMixChart rows={rows} backgroundNames={backgroundNames} showTooltip={showTooltip} hideTooltip={hideTooltip} />
                            </Card>
                        </div>

                        <Card title="All data" subtitle="Raw numbers per day">
                            <DataTable rows={rows} backgroundNames={backgroundNames} />
                        </Card>
                    </div>
                )}
            </div>

            {tooltip && (
                <div
                    role="tooltip"
                    className="pointer-events-none fixed z-50 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-lg"
                    style={{
                        left: Math.min(tooltip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 9999) - 220),
                        top: tooltip.y + 14,
                    }}
                >
                    {tooltip.content}
                </div>
            )}
        </main>
    );
}

/* ---------- Layout pieces ---------- */

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    return (
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <h2 className="text-lg">{title}</h2>
            {subtitle && <p className="font-regular text-sm text-srf-gs-800 mb-4">{subtitle}</p>}
            {children}
        </section>
    );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
    return (
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 font-regular text-sm text-srf-gs-900">
            {items.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.label}
                </li>
            ))}
        </ul>
    );
}

function TooltipBody({ title, lines }: { title: string; lines: { label: string; value: string; color?: string }[] }) {
    return (
        <div className="min-w-40">
            <p className="mb-1">{title}</p>
            <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0.5 font-regular">
                {lines.map((line) => (
                    <div key={line.label} className="contents">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: line.color ?? "transparent" }} />
                        <dt className="text-srf-gs-800">{line.label}</dt>
                        <dd className="text-right tabular-nums">{line.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function Kpi({ label, value, detail }: { label: string; value: string; detail?: string }) {
    return (
        <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <p className="font-regular text-sm text-srf-gs-800">{label}</p>
            <p className={`mt-1 truncate tabular-nums ${value.length > 6 ? "text-2xl leading-9" : "text-3xl"}`} title={value}>{value}</p>
            {detail && <p className="mt-1 font-regular text-sm text-srf-gs-800">{detail}</p>}
        </div>
    );
}

function KpiRow({ rows, backgroundNames }: { rows: DayRow[]; backgroundNames: string[] }) {
    const totalPhotos = rows.reduce((sum, row) => sum + row.photos, 0);
    const totalPrints = rows.reduce((sum, row) => sum + row.prints, 0);
    const busiest = rows.reduce((best, row) => (row.photos > best.photos ? row : best), rows[0]);
    const backgroundTotals = backgroundNames.map((name) => ({ name, count: rows.reduce((sum, row) => sum + (row.backgrounds[name] ?? 0), 0) }));
    const backgroundSum = backgroundTotals.reduce((sum, b) => sum + b.count, 0);
    const top = backgroundTotals.reduce((best, b) => (b.count > best.count ? b : best), backgroundTotals[0] ?? { name: "–", count: 0 });

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Photos" value={totalPhotos.toLocaleString("de-CH")} detail={`over ${rows.length} days`} />
            <Kpi label="Prints" value={totalPrints.toLocaleString("de-CH")} />
            <Kpi label="Prints per photo" value={totalPhotos ? decimal.format(totalPrints / totalPhotos) : "–"} />
            <Kpi label="Avg. photos / day" value={Math.round(totalPhotos / rows.length).toLocaleString("de-CH")} />
            <Kpi label="Busiest day" value={busiest.photos.toLocaleString("de-CH")} detail={busiest.label} />
            <Kpi label="Top background" value={top.name} detail={backgroundSum ? `${percent.format(top.count / backgroundSum)} of photos` : undefined} />
        </div>
    );
}

/* ---------- Charts ---------- */

interface ChartProps {
    rows: DayRow[];
    showTooltip: ShowTooltip;
    hideTooltip: () => void;
}

const AXIS_FONT = { fontSize: 12, fill: MUTED_INK, fontFamily: "SRG SSR Regular, system-ui, sans-serif" } as const;
const LABEL_FONT = { fontSize: 12, fill: SECONDARY_INK, fontFamily: "SRG SSR Regular, system-ui, sans-serif" } as const;

function YGrid({ ticks, scale, left, right, format = (t: number) => t.toLocaleString("de-CH") }: { ticks: number[]; scale: (v: number) => number; left: number; right: number; format?: (t: number) => string }) {
    return (
        <g>
            {ticks.map((tick) => (
                <g key={tick}>
                    <line x1={left} x2={right} y1={scale(tick)} y2={scale(tick)} stroke={tick === 0 ? AXIS_COLOR : GRID_COLOR} strokeWidth={1} />
                    <text x={left - 8} y={scale(tick)} dy="0.32em" textAnchor="end" {...AXIS_FONT}>
                        {format(tick)}
                    </text>
                </g>
            ))}
        </g>
    );
}

function PhotosVsPrintsChart({ rows, showTooltip, hideTooltip }: ChartProps) {
    const width = 960, height = 300;
    const margin = { top: 12, right: 8, bottom: 32, left: 44 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const { max, ticks } = niceScale(Math.max(...rows.map((r) => Math.max(r.photos, r.prints))));
    const y = (v: number) => margin.top + innerH - (v / max) * innerH;
    const band = innerW / rows.length;
    const barW = Math.min(28, band * 0.32);
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[640px] h-auto" role="img" aria-label="Photos and prints per day">
            <YGrid ticks={ticks} scale={y} left={margin.left} right={width - margin.right} />
            {rows.map((row, i) => {
                const cx = margin.left + band * i + band / 2;
                const active = hovered === row.day;
                return (
                    <g key={row.day} opacity={hovered && !active ? 0.45 : 1}>
                        <path d={barPath(cx - barW - 1, y(row.photos), barW, y(0) - y(row.photos))} fill={PHOTOS_COLOR} />
                        <path d={barPath(cx + 1, y(row.prints), barW, y(0) - y(row.prints))} fill={PRINTS_COLOR} />
                        <text x={cx} y={height - 10} textAnchor="middle" {...AXIS_FONT}>
                            {row.label}
                        </text>
                        <rect
                            x={margin.left + band * i}
                            y={margin.top}
                            width={band}
                            height={innerH}
                            fill="transparent"
                            onMouseMove={(e) => {
                                setHovered(row.day);
                                showTooltip(e, (
                                    <TooltipBody
                                        title={row.longLabel}
                                        lines={[
                                            { label: "Photos", value: String(row.photos), color: PHOTOS_COLOR },
                                            { label: "Prints", value: String(row.prints), color: PRINTS_COLOR },
                                            { label: "Prints per photo", value: row.photos ? decimal.format(row.prints / row.photos) : "–" },
                                        ]}
                                    />
                                ));
                            }}
                            onMouseLeave={() => {
                                setHovered(null);
                                hideTooltip();
                            }}
                        />
                    </g>
                );
            })}
        </svg>
    );
}

function PrintRatioChart({ rows, showTooltip, hideTooltip }: ChartProps) {
    const width = 560, height = 260;
    const margin = { top: 20, right: 8, bottom: 32, left: 40 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const ratios = rows.map((r) => (r.photos ? r.prints / r.photos : 0));
    const { max, ticks } = niceScale(Math.max(1.2, ...ratios), 4);
    const y = (v: number) => margin.top + innerH - (v / max) * innerH;
    const band = innerW / rows.length;
    const barW = Math.min(32, band * 0.6);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Prints per photo per day">
            <YGrid ticks={ticks} scale={y} left={margin.left} right={width - margin.right} format={(t) => decimal.format(t)} />
            {rows.map((row, i) => {
                const ratio = ratios[i];
                const cx = margin.left + band * i + band / 2;
                return (
                    <g key={row.day}>
                        <path d={barPath(cx - barW / 2, y(ratio), barW, y(0) - y(ratio))} fill={PRINTS_COLOR} />
                        <text x={cx} y={y(ratio) - 6} textAnchor="middle" {...LABEL_FONT}>
                            {row.photos ? decimal.format(ratio) : "–"}
                        </text>
                        <text x={cx} y={height - 10} textAnchor="middle" {...AXIS_FONT} fontSize={11}>
                            {row.dateLabel}
                        </text>
                        <rect
                            x={margin.left + band * i}
                            y={margin.top}
                            width={band}
                            height={innerH}
                            fill="transparent"
                            onMouseMove={(e) =>
                                showTooltip(e, (
                                    <TooltipBody
                                        title={row.longLabel}
                                        lines={[
                                            { label: "Prints per photo", value: row.photos ? decimal.format(ratio) : "–", color: PRINTS_COLOR },
                                            { label: "Photos", value: String(row.photos) },
                                            { label: "Prints", value: String(row.prints) },
                                        ]}
                                    />
                                ))
                            }
                            onMouseLeave={hideTooltip}
                        />
                    </g>
                );
            })}
            {/* Reference line: one print per photo */}
            <line x1={margin.left} x2={width - margin.right} y1={y(1)} y2={y(1)} stroke={SECONDARY_INK} strokeWidth={1} strokeDasharray="4 4" />
            <text x={margin.left + 4} y={y(1) - 5} {...LABEL_FONT}>
                1 print / photo
            </text>
        </svg>
    );
}

function CumulativeChart({ rows, showTooltip, hideTooltip }: ChartProps) {
    const width = 560, height = 260;
    const margin = { top: 12, right: 56, bottom: 32, left: 44 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const cumulative = rows.reduce<{ photos: number; prints: number }[]>((acc, row) => {
        const prev = acc[acc.length - 1] ?? { photos: 0, prints: 0 };
        acc.push({ photos: prev.photos + row.photos, prints: prev.prints + row.prints });
        return acc;
    }, []);
    const last = cumulative[cumulative.length - 1];
    const { max, ticks } = niceScale(Math.max(last.photos, last.prints));
    const y = (v: number) => margin.top + innerH - (v / max) * innerH;
    const x = (i: number) => margin.left + (rows.length === 1 ? innerW / 2 : (innerW * i) / (rows.length - 1));
    const line = (key: "photos" | "prints") => cumulative.map((c, i) => `${i ? "L" : "M"}${x(i)},${y(c[key])}`).join("");
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            role="img"
            aria-label="Cumulative photos and prints"
            onMouseLeave={() => {
                setHovered(null);
                hideTooltip();
            }}
        >
            <YGrid ticks={ticks} scale={y} left={margin.left} right={width - margin.right} />
            {hovered !== null && <line x1={x(hovered)} x2={x(hovered)} y1={margin.top} y2={margin.top + innerH} stroke={AXIS_COLOR} strokeWidth={1} />}
            <path d={line("photos")} fill="none" stroke={PHOTOS_COLOR} strokeWidth={2} strokeLinejoin="round" />
            <path d={line("prints")} fill="none" stroke={PRINTS_COLOR} strokeWidth={2} strokeLinejoin="round" />
            {cumulative.map((c, i) => (
                <g key={rows[i].day}>
                    <circle cx={x(i)} cy={y(c.photos)} r={hovered === i ? 5 : 3} fill={PHOTOS_COLOR} stroke="#fff" strokeWidth={2} />
                    <circle cx={x(i)} cy={y(c.prints)} r={hovered === i ? 5 : 3} fill={PRINTS_COLOR} stroke="#fff" strokeWidth={2} />
                    {(i === 0 || i === rows.length - 1 || rows.length <= 6) && (
                        <text x={x(i)} y={height - 10} textAnchor="middle" {...AXIS_FONT} fontSize={11}>
                            {rows[i].dateLabel}
                        </text>
                    )}
                </g>
            ))}
            {/* Direct end labels */}
            <text x={x(rows.length - 1) + 8} y={y(last.photos)} dy="0.32em" {...LABEL_FONT}>
                {last.photos}
            </text>
            <text x={x(rows.length - 1) + 8} y={y(last.prints)} dy="0.32em" {...LABEL_FONT}>
                {last.prints}
            </text>
            {rows.map((row, i) => {
                const half = rows.length === 1 ? innerW / 2 : innerW / (rows.length - 1) / 2;
                return (
                    <rect
                        key={row.day}
                        x={x(i) - half}
                        y={margin.top}
                        width={half * 2}
                        height={innerH}
                        fill="transparent"
                        onMouseMove={(e) => {
                            setHovered(i);
                            showTooltip(e, (
                                <TooltipBody
                                    title={`Up to ${row.longLabel}`}
                                    lines={[
                                        { label: "Photos", value: String(cumulative[i].photos), color: PHOTOS_COLOR },
                                        { label: "Prints", value: String(cumulative[i].prints), color: PRINTS_COLOR },
                                    ]}
                                />
                            ));
                        }}
                    />
                );
            })}
        </svg>
    );
}

function BackgroundTotalsChart({ rows, backgroundNames, showTooltip, hideTooltip }: ChartProps & { backgroundNames: string[] }) {
    const totals = backgroundNames
        .map((name, i) => ({ name, color: BACKGROUND_COLORS[i % BACKGROUND_COLORS.length], count: rows.reduce((sum, row) => sum + (row.backgrounds[name] ?? 0), 0) }))
        .sort((a, b) => b.count - a.count);
    const sum = totals.reduce((s, t) => s + t.count, 0);
    const maxCount = Math.max(1, ...totals.map((t) => t.count));
    const rowH = 40, labelW = 100, valueW = 90;
    const width = 560, height = totals.length * rowH;
    const barMax = width - labelW - valueW;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Photos per background">
            {totals.map((t, i) => {
                const w = (t.count / maxCount) * barMax;
                const yPos = i * rowH + 8;
                return (
                    <g
                        key={t.name}
                        onMouseMove={(e) =>
                            showTooltip(e, <TooltipBody title={t.name} lines={[{ label: "Photos", value: String(t.count), color: t.color }, { label: "Share", value: sum ? percent.format(t.count / sum) : "–" }]} />)
                        }
                        onMouseLeave={hideTooltip}
                    >
                        <rect x={0} y={i * rowH} width={width} height={rowH} fill="transparent" />
                        <text x={labelW - 12} y={yPos + 12} dy="0.32em" textAnchor="end" {...LABEL_FONT} fontSize={14} fill="#0b0b0b">
                            {t.name}
                        </text>
                        <path d={barPath(labelW, yPos, w, 24, "right")} fill={t.color} />
                        <text x={labelW + w + 8} y={yPos + 12} dy="0.32em" {...LABEL_FONT} fontSize={13}>
                            {t.count} · {sum ? percent.format(t.count / sum) : "–"}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function BackgroundMixChart({ rows, backgroundNames, showTooltip, hideTooltip }: ChartProps & { backgroundNames: string[] }) {
    const rowH = 30, labelW = 80;
    const width = 560, height = rows.length * rowH;
    const barW = width - labelW - 44;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Background share per day">
            {rows.map((row, i) => {
                const total = backgroundNames.reduce((s, name) => s + (row.backgrounds[name] ?? 0), 0);
                const yPos = i * rowH + 5;
                let offset = 0;
                return (
                    <g key={row.day}>
                        <text x={labelW - 10} y={yPos + 10} dy="0.32em" textAnchor="end" {...AXIS_FONT}>
                            {row.label}
                        </text>
                        {total === 0 && (
                            <text x={labelW} y={yPos + 10} dy="0.32em" {...AXIS_FONT}>
                                no photos
                            </text>
                        )}
                        {total > 0 &&
                            backgroundNames.map((name, b) => {
                                const count = row.backgrounds[name] ?? 0;
                                if (!count) return null;
                                const w = (count / total) * barW;
                                const segX = labelW + offset;
                                offset += w;
                                return (
                                    <rect
                                        key={name}
                                        x={segX}
                                        y={yPos}
                                        // 2px surface gap between stacked segments
                                        width={Math.max(0, w - 2)}
                                        height={20}
                                        rx={2}
                                        fill={BACKGROUND_COLORS[b % BACKGROUND_COLORS.length]}
                                        onMouseMove={(e) =>
                                            showTooltip(e, (
                                                <TooltipBody
                                                    title={`${name} · ${row.longLabel}`}
                                                    lines={[
                                                        { label: "Photos", value: String(count), color: BACKGROUND_COLORS[b % BACKGROUND_COLORS.length] },
                                                        { label: "Share of day", value: percent.format(count / total) },
                                                    ]}
                                                />
                                            ))
                                        }
                                        onMouseLeave={hideTooltip}
                                    />
                                );
                            })}
                        <text x={width} y={yPos + 10} dy="0.32em" textAnchor="end" {...AXIS_FONT}>
                            n={total}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function DataTable({ rows, backgroundNames }: { rows: DayRow[]; backgroundNames: string[] }) {
    const totals = {
        photos: rows.reduce((s, r) => s + r.photos, 0),
        prints: rows.reduce((s, r) => s + r.prints, 0),
    };
    const cell = "px-3 py-2 text-right tabular-nums";
    return (
        <div className="overflow-x-auto">
            <table className="w-full font-regular text-sm">
                <thead>
                    <tr className="border-b border-srf-gs-100 text-srf-gs-800">
                        <th className="px-3 py-2 text-left font-normal">Day</th>
                        <th className={`${cell} font-normal`}>Photos</th>
                        <th className={`${cell} font-normal`}>Prints</th>
                        <th className={`${cell} font-normal`}>Prints / photo</th>
                        {backgroundNames.map((name) => (
                            <th key={name} className={`${cell} font-normal`}>
                                {name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.day} className="border-b border-srf-gs-50 hover:bg-srf-wg-25">
                            <td className="px-3 py-2 whitespace-nowrap">{row.longLabel}</td>
                            <td className={cell}>{row.photos}</td>
                            <td className={cell}>{row.prints}</td>
                            <td className={cell}>{row.photos ? decimal.format(row.prints / row.photos) : "–"}</td>
                            {backgroundNames.map((name) => (
                                <td key={name} className={cell}>
                                    {row.backgrounds[name] ?? 0}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold">
                        <td className="px-3 py-2" style={{ fontFamily: "SRG SSR Type Text App" }}>Total</td>
                        <td className={cell}>{totals.photos}</td>
                        <td className={cell}>{totals.prints}</td>
                        <td className={cell}>{totals.photos ? decimal.format(totals.prints / totals.photos) : "–"}</td>
                        {backgroundNames.map((name) => (
                            <td key={name} className={cell}>
                                {rows.reduce((s, r) => s + (r.backgrounds[name] ?? 0), 0)}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
