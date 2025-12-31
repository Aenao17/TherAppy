import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonModal } from "@ionic/react";
import {useEffect, useMemo, useRef, useState} from "react";
import { PanicEvent } from "../hooks/usePanicSocket";
import { postJsonAuth } from "../api/api";
import VideoRoom from "./VideoRoom";

type Props = {
    event: PanicEvent | null;
    onClose: () => void;
};

async function ackAlert(alertId: number, withVideo: boolean) {
    await postJsonAuth<void>(`/api/panic/${alertId}/ack`, { withVideo });
}

const PanicAlarmOverlay: React.FC<Props> = ({ event, onClose }) => {
    const isOpen = !!event;
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [inCall, setInCall] = useState(false); // Stare pentru apel

    useEffect(() => {
        if (!event) setInCall(false);
    }, [event]);

    const title = useMemo(() => {
        if (!event) return "Panic alert";
        return `🚨 Panic alert`;
    }, [event]);

    useEffect(() => {
        if (!isOpen || inCall) return;

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
    }, [isOpen, inCall]);

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
            await ackAlert(event.alertId, false);
        } catch {
            // even if ack fails, we still close locally; UX > strictness
        } finally {
            stopEverything();
            onClose();
        }
    };

    const handleAcceptCall = async () => {
        if (!event) return;

        // 1. Oprim sunetul și vibrațiile imediat
        stopEverything();

        // 2. Trimitem confirmarea (ACK) la server ca să știe că am preluat
        try {
            await ackAlert(event.alertId, true);
        } catch {
            console.error("Failed to ack, continuing to call anyway");
        }

        // 3. Intrăm în interfața video
        setInCall(true);
    };

    const handleStartSound = async () => {
        if (!audioRef.current) return;
        try {
            await audioRef.current.play();
        } catch {
            // ignore
        }
    };

    //MOD APEL VIDEO
    if (inCall && event?.videoRoomId) {
        return (
            <IonModal isOpen={true} backdropDismiss={false}>
                <VideoRoom
                    roomName={event.videoRoomId}
                    displayName="Psiholog"
                    onClose={() => {
                        setInCall(false);
                        onClose(); // Închidem tot overlay-ul când se termină apelul
                    }}
                />
            </IonModal>
        );
    }

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
                            {/* Buton NOU de preluare apel */}
                            {event?.videoRoomId && (
                                <IonButton expand="block" color="success" onClick={handleAcceptCall}>
                                    📞 Acceptă Apel Video
                                </IonButton>
                            )}
                            <IonButton expand="block" color="danger" onClick={handleAcknowledge}>
                                {event?.videoRoomId ?  "Doar confirmare (Fără Video)" : "Acknowledge & Stop Alarm"}
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