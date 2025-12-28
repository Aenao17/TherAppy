import {
    IonAlert,
    IonButton,
    IonIcon,
    IonToast,
} from "@ionic/react";
import { alertCircle } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { triggerPanic } from "../api/panic";

type Props = {
    enabled: boolean; // doar pentru CLIENT
};

const HOLD_SECONDS = 5;

const PanicButton: React.FC<Props> = ({ enabled }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const holdTimerRef = useRef<number | null>(null);
    const holdStartRef = useRef<number>(0);
    const [holdProgress, setHoldProgress] = useState(0); // 0..1
    const progressTimerRef = useRef<number | null>(null);

    const clearHoldTimers = () => {
        if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
        if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
        holdTimerRef.current = null;
        progressTimerRef.current = null;
        setHoldProgress(0);
    };

    useEffect(() => {
        return () => clearHoldTimers();
    }, []);

    const send = async (longPress: boolean) => {
        if (isSending) return;
        setIsSending(true);
        try {
            await triggerPanic(longPress);
            setToastMsg(longPress ? "🚨 Panic alert sent (long press)" : "🚨 Panic alert sent");
            setShowToast(true);
        } catch {
            setToastMsg("Failed to send panic alert");
            setShowToast(true);
        } finally {
            setIsSending(false);
        }
    };

    const startHold = () => {
        if (!enabled || isSending) return;

        holdStartRef.current = Date.now();

        // update progress 20x/sec
        progressTimerRef.current = window.setInterval(() => {
            const elapsed = Date.now() - holdStartRef.current;
            const p = Math.min(1, elapsed / (HOLD_SECONDS * 1000));
            setHoldProgress(p);
        }, 50);

        // if reaches 5s -> auto send
        holdTimerRef.current = window.setTimeout(async () => {
            clearHoldTimers();
            await send(true);
        }, HOLD_SECONDS * 1000);
    };

    const endHold = () => {
        // if released before full -> cancel and show confirm on normal click/tap
        const elapsed = Date.now() - holdStartRef.current;
        const completed = elapsed >= HOLD_SECONDS * 1000;

        clearHoldTimers();

        // If it already completed, send() was fired.
        if (!completed && enabled && !isSending) {
            // tap behavior: confirm popup
            setShowConfirm(true);
        }
    };

    if (!enabled) return null;

    // circle progress (SVG)
    const r = 22;
    const c = 2 * Math.PI * r;
    const dash = c * holdProgress;

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    right: 16,
                    bottom: 16,
                    zIndex: 9999,
                }}
            >
                <div style={{ position: "relative", width: 64, height: 64 }}>
                    {/* progress ring */}
                    <svg
                        width="64"
                        height="64"
                        style={{
                            position: "absolute",
                            inset: 0,
                            transform: "rotate(-90deg)",
                            pointerEvents: "none",
                            opacity: holdProgress > 0 ? 0.9 : 0,
                            transition: "opacity 120ms ease",
                        }}
                    >
                        <circle
                            cx="32"
                            cy="32"
                            r={r}
                            stroke="currentColor"
                            strokeWidth="5"
                            fill="none"
                            opacity="0.2"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r={r}
                            stroke="currentColor"
                            strokeWidth="5"
                            fill="none"
                            strokeDasharray={`${dash} ${c - dash}`}
                            opacity="0.9"
                        />
                    </svg>

                    <IonButton
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 9999,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
                        }}
                        color="danger"
                        onMouseDown={startHold}
                        onMouseUp={endHold}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            startHold();
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            endHold();
                        }}
                        disabled={isSending}
                    >
                        <IonIcon icon={alertCircle} style={{ fontSize: 28 }} />
                    </IonButton>

                    {/* small hint */}
                    {holdProgress > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                top: -22,
                                left: "50%",
                                transform: "translateX(-50%)",
                                fontSize: 11,
                                opacity: 0.9,
                                background: "rgba(0,0,0,0.65)",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: 999,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Hold {HOLD_SECONDS}s
                        </div>
                    )}
                </div>
            </div>

            <IonAlert
                isOpen={showConfirm}
                header="Send panic alert?"
                message="This will notify your psychologist immediately."
                onDidDismiss={() => setShowConfirm(false)}
                buttons={[
                    { text: "Cancel", role: "cancel" },
                    {
                        text: "Send",
                        role: "confirm",
                        handler: async () => {
                            await send(false);
                        },
                    },
                ]}
            />

            <IonToast
                isOpen={showToast}
                message={toastMsg}
                duration={2000}
                onDidDismiss={() => setShowToast(false)}
            />
        </>
    );
};

export default PanicButton;
