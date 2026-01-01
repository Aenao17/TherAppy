import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonLoading, IonToast } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { getClientMood, MoodPoint } from "../api/clientProfile";

type Props = { clientId: number };

type Point = {
    x: number;
    y: number;
    score: number;
    createdAt: string;
};

// ✅ 5 culori (cerința ta)
const moodColor = (score: number) => {
    switch (score) {
        case 1: return "#E53935"; // roșu intens
        case 2: return "#FF6B6B"; // roșu deschis
        case 3: return "#FF9800"; // portocaliu
        case 4: return "#66BB6A"; // verde deschis
        case 5: return "#00C853"; // verde aprins
        default: return "#9E9E9E";
    }
};

const moodLabel = (score: number) => {
    switch (score) {
        case 1: return "Very bad";
        case 2: return "Bad";
        case 3: return "Okay";
        case 4: return "Good";
        case 5: return "Very good";
        default: return "—";
    }
};

const clampScore = (s: number) => Math.max(1, Math.min(5, Math.round(s)));

const ClientMoodChartWidget: React.FC<Props> = ({ clientId }) => {
    const [items, setItems] = useState<MoodPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    // Tooltip/selection
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        getClientMood(clientId)
            .then((data) => mounted && setItems(data))
            .catch(() => mounted && setShowError(true))
            .finally(() => mounted && setIsLoading(false));
        return () => {
            mounted = false;
        };
    }, [clientId]);

    // ---- Chart sizing + padding (for axes labels)
    const W = 560;
    const H = 220;

    const pad = { l: 44, r: 14, t: 16, b: 34 };
    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;

    const sorted = useMemo(() => {
        // ensure ascending by time
        return [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [items]);

    const points: Point[] = useMemo(() => {
        if (sorted.length === 0) return [];

        const maxX = Math.max(1, sorted.length - 1);

        const mapY = (score: number) => {
            const sc = clampScore(score);
            // score 1..5 -> 0..1
            const t = (sc - 1) / 4;
            // invert so 5 is top
            return pad.t + (1 - t) * innerH;
        };

        return sorted.map((p, idx) => {
            const x = pad.l + (idx / maxX) * innerW;
            const y = mapY(p.score);
            return { x, y, score: clampScore(p.score), createdAt: p.createdAt };
        });
    }, [sorted, innerW, innerH, pad.l, pad.t]);

    const polylinePoints = useMemo(() => points.map((p) => `${p.x},${p.y}`).join(" "), [points]);

    const lastPoint = points.length ? points[points.length - 1] : null;

    // X labels: show 3 labels (start/middle/end) to avoid clutter
    const xLabels = useMemo(() => {
        if (sorted.length === 0) return [];
        const idxs = sorted.length === 1 ? [0] : [0, Math.floor((sorted.length - 1) / 2), sorted.length - 1];
        const unique = Array.from(new Set(idxs));
        return unique.map((i) => ({
            idx: i,
            date: new Date(sorted[i].createdAt),
            x: points[i]?.x ?? pad.l,
        }));
    }, [sorted, points, pad.l]);

    const yTicks = [1, 2, 3, 4, 5];

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString();
    const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

    // ✅ Average mood (cerut)
    const avg = useMemo(() => {
        if (sorted.length === 0) return null;
        const sum = sorted.reduce((acc, p) => acc + clampScore(p.score), 0);
        const v = sum / sorted.length;
        return Math.round(v * 10) / 10; // 1 zecimală
    }, [sorted]);

    const avgRoundedInt = useMemo(() => {
        if (avg == null) return null;
        return clampScore(Math.round(avg));
    }, [avg]);

    const avgColor = avgRoundedInt == null ? "#9E9E9E" : moodColor(avgRoundedInt);

    // helper pt tooltip
    const getTooltipBox = (p: Point) => {
        const boxW = 200;
        const boxH = 56;
        const left = Math.min(p.x + 10, W - boxW - 6);
        const top = Math.max(p.y - boxH - 10, 6);
        return { left, top, boxW, boxH };
    };

    return (
        <>
            {/* ✅ Average mood card (graficul 2 cerut) */}
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Average mood</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    {sorted.length === 0 ? (
                        <div style={{ opacity: 0.7 }}>No mood entries yet.</div>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gap: 12,
                                padding: 12,
                                borderRadius: 16,
                                border: "1px solid rgba(123, 97, 255, 0.18)",
                                background: "rgba(123, 97, 255, 0.06)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 12, opacity: 0.75 }}>Average score</div>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>
                                            {avg}
                                        </div>
                                        <div style={{ fontSize: 14, opacity: 0.7, fontWeight: 800 }}>/5</div>
                                    </div>
                                    <div style={{ marginTop: 2, opacity: 0.8, fontWeight: 700 }}>
                                        {avgRoundedInt ? moodLabel(avgRoundedInt) : "—"}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        minWidth: 56,
                                        height: 44,
                                        borderRadius: 14,
                                        display: "grid",
                                        placeItems: "center",
                                        color: "#fff",
                                        fontWeight: 900,
                                        fontSize: 18,
                                        background: avgColor,
                                        boxShadow: "0 14px 26px rgba(0,0,0,0.12)",
                                    }}
                                    title="Average rounded"
                                >
                                    {avgRoundedInt ?? "—"}
                                </div>
                            </div>

                            {/* bar */}
                            <div
                                style={{
                                    width: "100%",
                                    height: 12,
                                    borderRadius: 999,
                                    overflow: "hidden",
                                    background: "rgba(0,0,0,0.06)",
                                    border: "1px solid rgba(0,0,0,0.06)",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${avg == null ? 0 : (avg / 5) * 100}%`,
                                        background: avgColor,
                                        borderRadius: 999,
                                        transition: "width 220ms ease",
                                    }}
                                />
                            </div>

                            {/* legend */}
                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span
                                        key={s}
                                        title={`${s} - ${moodLabel(s)}`}
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 999,
                                            background: moodColor(s),
                                            boxShadow: "0 6px 12px rgba(0,0,0,0.10)",
                                            display: "inline-block",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </IonCardContent>
            </IonCard>

            {/* ✅ Trend chart card */}
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Mood trend</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                    {sorted.length === 0 ? (
                        <div style={{ opacity: 0.7 }}>No mood entries yet.</div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 10, opacity: 0.85 }}>
                                Last recorded:{" "}
                                <b style={{ color: lastPoint ? moodColor(lastPoint.score) : "currentColor" }}>
                                    {lastPoint?.score}
                                </b>{" "}
                                (1–5) · {lastPoint ? formatDateTime(lastPoint.createdAt) : ""}
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <svg
                                    width={W}
                                    height={H}
                                    style={{ display: "block" }}
                                    onMouseLeave={() => setActiveIdx(null)}
                                >
                                    {/* defs for glow */}
                                    <defs>
                                        <filter id="moodGlow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="5" result="blur" />
                                            <feColorMatrix
                                                in="blur"
                                                type="matrix"
                                                values="
                          1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 0.35 0"
                                                result="coloredBlur"
                                            />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>

                                        <linearGradient id="lavLine" x1="0" x2="1">
                                            <stop offset="0%" stopColor="rgba(123,97,255,0.35)" />
                                            <stop offset="100%" stopColor="rgba(123,97,255,0.70)" />
                                        </linearGradient>
                                    </defs>

                                    {/* Grid horizontal + Y labels */}
                                    {yTicks.map((t) => {
                                        const y = pad.t + (1 - (t - 1) / 4) * innerH;
                                        return (
                                            <g key={t}>
                                                <line
                                                    x1={pad.l}
                                                    y1={y}
                                                    x2={pad.l + innerW}
                                                    y2={y}
                                                    stroke="currentColor"
                                                    opacity={t === 3 ? 0.18 : 0.12}
                                                />
                                                <text
                                                    x={pad.l - 10}
                                                    y={y + 4}
                                                    textAnchor="end"
                                                    fontSize="11"
                                                    fill="currentColor"
                                                    opacity="0.7"
                                                >
                                                    {t}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Axes */}
                                    <line
                                        x1={pad.l}
                                        y1={pad.t}
                                        x2={pad.l}
                                        y2={pad.t + innerH}
                                        stroke="currentColor"
                                        opacity="0.35"
                                    />
                                    <line
                                        x1={pad.l}
                                        y1={pad.t + innerH}
                                        x2={pad.l + innerW}
                                        y2={pad.t + innerH}
                                        stroke="currentColor"
                                        opacity="0.35"
                                    />

                                    {/* Axis titles */}
                                    <text x={pad.l} y={12} fontSize="11" fill="currentColor" opacity="0.75">
                                        Mood (1–5)
                                    </text>

                                    {/* Polyline (lavender) */}
                                    <polyline
                                        points={polylinePoints}
                                        fill="none"
                                        stroke="url(#lavLine)"
                                        strokeWidth="3.2"
                                        opacity="0.95"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />

                                    {/* Points + interaction */}
                                    {points.map((p, idx) => {
                                        const active = activeIdx === idx;
                                        const c = moodColor(p.score);

                                        return (
                                            <g key={idx}>
                                                {/* bigger invisible hit area */}
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={14}
                                                    fill="transparent"
                                                    onMouseEnter={() => setActiveIdx(idx)}
                                                    onClick={() => setActiveIdx(idx)}
                                                    style={{ cursor: "pointer" }}
                                                />

                                                {/* active ring */}
                                                {active && (
                                                    <circle
                                                        cx={p.x}
                                                        cy={p.y}
                                                        r={11}
                                                        fill="transparent"
                                                        stroke={c}
                                                        strokeWidth={3}
                                                        opacity={0.95}
                                                        filter="url(#moodGlow)"
                                                    />
                                                )}

                                                {/* visible dot */}
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={active ? 6 : 5}
                                                    fill={c}
                                                    opacity={1}
                                                    style={{ filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.14))" }}
                                                />
                                            </g>
                                        );
                                    })}

                                    {/* X labels */}
                                    {xLabels.map((l) => (
                                        <text
                                            key={l.idx}
                                            x={l.x}
                                            y={pad.t + innerH + 18}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fill="currentColor"
                                            opacity="0.7"
                                        >
                                            {formatDate(l.date.toISOString())}
                                        </text>
                                    ))}

                                    {/* Tooltip */}
                                    {activeIdx !== null && points[activeIdx] && (
                                        (() => {
                                            const p = points[activeIdx];
                                            const { left, top, boxW, boxH } = getTooltipBox(p);
                                            const c = moodColor(p.score);

                                            return (
                                                <g>
                                                    <rect
                                                        x={left}
                                                        y={top}
                                                        width={boxW}
                                                        height={boxH}
                                                        rx={12}
                                                        ry={12}
                                                        fill="var(--ion-card-background, #fff)"
                                                        stroke={c}
                                                        opacity="0.97"
                                                    />

                                                    {/* score badge (colored, text white) */}
                                                    <rect
                                                        x={left + 10}
                                                        y={top + 10}
                                                        width={34}
                                                        height={28}
                                                        rx={10}
                                                        ry={10}
                                                        fill={c}
                                                        opacity="1"
                                                    />
                                                    <text
                                                        x={left + 27}
                                                        y={top + 30}
                                                        textAnchor="middle"
                                                        fontSize="13"
                                                        fill="#fff"
                                                        style={{ fontWeight: 900 }}
                                                    >
                                                        {p.score}
                                                    </text>

                                                    <text x={left + 52} y={top + 22} fontSize="12" fill="currentColor" opacity="0.92">
                                                        {moodLabel(p.score)}
                                                    </text>
                                                    <text x={left + 52} y={top + 42} fontSize="11" fill="currentColor" opacity="0.7">
                                                        {formatDateTime(p.createdAt)}
                                                    </text>
                                                </g>
                                            );
                                        })()
                                    )}
                                </svg>
                            </div>

                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                                Tap a point to see details.
                            </div>
                        </>
                    )}
                </IonCardContent>
            </IonCard>

            <IonLoading isOpen={isLoading} message="Loading mood..." />
            <IonToast
                isOpen={showError}
                message="Failed to load mood"
                duration={2000}
                onDidDismiss={() => setShowError(false)}
            />
        </>
    );
};

export default ClientMoodChartWidget;
