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
            // score 1..5 -> 0..1
            const t = (score - 1) / 4;
            // invert so 5 is top
            return pad.t + (1 - t) * innerH;
        };

        return sorted.map((p, idx) => {
            const x = pad.l + (idx / maxX) * innerW;
            const y = mapY(p.score);
            return { x, y, score: p.score, createdAt: p.createdAt };
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

    return (
        <>
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Mood trend</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                    {sorted.length === 0 ? (
                        <div style={{ opacity: 0.7 }}>No mood entries yet.</div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 10, opacity: 0.8 }}>
                                Last recorded: <b>{lastPoint?.score}</b> (1–5) · {lastPoint ? formatDateTime(lastPoint.createdAt) : ""}
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <svg
                                    width={W}
                                    height={H}
                                    style={{ display: "block" }}
                                    onMouseLeave={() => setActiveIdx(null)}
                                >
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

                                    {/* Axis titles (subtle) */}
                                    <text x={pad.l} y={12} fontSize="11" fill="currentColor" opacity="0.75">
                                        Mood (1–5)
                                    </text>

                                    {/* Polyline */}
                                    <polyline
                                        points={polylinePoints}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        opacity="0.95"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />

                                    {/* Points + interaction */}
                                    {points.map((p, idx) => {
                                        const active = activeIdx === idx;
                                        return (
                                            <g key={idx}>
                                                {/* bigger invisible hit area */}
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={12}
                                                    fill="transparent"
                                                    onMouseEnter={() => setActiveIdx(idx)}
                                                    onClick={() => setActiveIdx(idx)}
                                                    style={{ cursor: "pointer" }}
                                                />
                                                {/* visible dot */}
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={active ? 5 : 4}
                                                    fill="currentColor"
                                                    opacity={active ? 1 : 0.85}
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
                                            const boxW = 180;
                                            const boxH = 46;

                                            // keep tooltip within bounds
                                            const left = Math.min(p.x + 10, W - boxW - 6);
                                            const top = Math.max(p.y - boxH - 10, 6);

                                            return (
                                                <g>
                                                    <rect
                                                        x={left}
                                                        y={top}
                                                        width={boxW}
                                                        height={boxH}
                                                        rx={10}
                                                        ry={10}
                                                        fill="var(--ion-card-background, #fff)"
                                                        stroke="currentColor"
                                                        opacity="0.95"
                                                    />
                                                    <text x={left + 10} y={top + 18} fontSize="12" fill="currentColor" opacity="0.9">
                                                        Score: {p.score}
                                                    </text>
                                                    <text x={left + 10} y={top + 36} fontSize="11" fill="currentColor" opacity="0.7">
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