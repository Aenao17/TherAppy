import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonModal } from "@ionic/react";
import { useEffect, useMemo, useRef } from "react";
import { PanicEvent } from "../hooks/usePanicSocket";
import { postJsonAuth } from "../api/api";

type Props = {
    event: PanicEvent | null;
    onClose: () => void;
};

async function ackAlert(alertId: number) {
    await postJsonAuth<void>(`/api/panic/${alertId}/ack`, {});
}

const PanicAlarmOverlay: React.FC<Props> = ({ event, onClose }) => {
    const isOpen = !!event;
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const title = useMemo(() => {
        if (!event) return "Panic alert";
        return `🚨 Panic alert`;
    }, [event]);

    useEffect(() => {
        if (!isOpen) return;

        // 1) SOUND (loop)
        const audio = new Audio("/sounds/siren.mp3");
        audio.loop = true;
        audio.volume = 1.0;
        audioRef.current = audio;

        // Autoplay policy: in some browsers, play may fail unless user interaction.
        // Still try; if it fails, the modal will be visible and user can tap "Start sound".
        audio.play().catch(() => {});

        // 2) VIBRATION (mobile)
        if (navigator.vibrate) {
            // pattern: vibrate 700ms, pause 300ms, repeat...
            navigator.vibrate([700, 300, 700, 300, 700]);
        }

        return () => {
            // stop vibration
            if (navigator.vibrate) navigator.vibrate(0);

            // stop sound
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            audioRef.current = null;
        };
    }, [isOpen]);

    const stopEverything = () => {
        if (navigator.vibrate) navigator.vibrate(0);

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const handleAcknowledge = async () => {
        if (!event) return;

        try {
            await ackAlert(event.alertId);
        } catch {
            // even if ack fails, we still close locally; UX > strictness
        } finally {
            stopEverything();
            onClose();
        }
    };

    const handleStartSound = async () => {
        if (!audioRef.current) return;
        try {
            await audioRef.current.play();
        } catch {
            // ignore
        }
    };

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false}>
            <div style={{ padding: 16, height: "100%", display: "grid", placeItems: "center" }}>
                <IonCard style={{ width: "min(720px, 96%)" }}>
                    <IonCardHeader>
                        <IonCardTitle>{title}</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                        {event && (
                            <>
                                <div style={{ fontSize: 16, marginBottom: 8 }}>
                                    Client: <b>@{event.clientUsername}</b>
                                </div>
                                <div style={{ opacity: 0.8, marginBottom: 12 }}>
                                    Trigger: <b>{event.triggeredByLongPress ? "Long press (auto)" : "Tap + confirm"}</b>
                                    <br />
                                    Time: {new Date(event.createdAt).toLocaleString()}
                                </div>
                            </>
                        )}

                        <div style={{ display: "grid", gap: 10 }}>
                            <IonButton expand="block" color="danger" onClick={handleAcknowledge}>
                                Acknowledge & Stop Alarm
                            </IonButton>

                            <IonButton expand="block" fill="outline" onClick={handleStartSound}>
                                Start sound (if blocked)
                            </IonButton>

                            <div style={{ fontSize: 12, opacity: 0.7 }}>
                                Note: Some browsers block autoplay sound until you tap a button.
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>
            </div>
        </IonModal>
    );
};

export default PanicAlarmOverlay;