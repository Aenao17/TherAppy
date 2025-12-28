import { IonButton, IonCard, IonCardContent, IonCheckbox, IonItem, IonLabel } from "@ionic/react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "privacy_gate_until";
const DEFAULT_MINUTES = 15;

function nowMs() {
    return Date.now();
}

function readUntil(): number {
    const v = sessionStorage.getItem(STORAGE_KEY);
    const n = v ? Number(v) : 0;
    return Number.isFinite(n) ? n : 0;
}

function writeUntil(until: number) {
    sessionStorage.setItem(STORAGE_KEY, String(until));
}

function clearUntil() {
    sessionStorage.removeItem(STORAGE_KEY);
}

type Props = {
    minutes?: number;
    children: React.ReactNode;
};

const PrivacyGate: React.FC<Props> = ({ minutes = DEFAULT_MINUTES, children }) => {
    const [checked, setChecked] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    // init + keep in sync (including refresh)
    useEffect(() => {
        const tick = () => {
            const until = readUntil();
            const unlocked = until > nowMs();
            setIsUnlocked(unlocked);
            if (!unlocked && until !== 0) clearUntil();
        };

        tick();

        // also listen to session changes (rare but safe)
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) tick();
        };
        window.addEventListener("storage", onStorage);

        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // auto-expire while page stays open
    useEffect(() => {
        if (!isUnlocked) return;

        const until = readUntil();
        const msLeft = until - nowMs();
        if (msLeft <= 0) {
            setIsUnlocked(false);
            clearUntil();
            return;
        }

        const t = window.setTimeout(() => {
            setIsUnlocked(false);
            clearUntil();
        }, msLeft);

        return () => window.clearTimeout(t);
    }, [isUnlocked]);

    const unlock = () => {
        const until = nowMs() + minutes * 60_000;
        writeUntil(until);
        setIsUnlocked(true);
        setChecked(false);
    };

    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    filter: isUnlocked ? "none" : "blur(10px)",
                    opacity: isUnlocked ? 1 : 0.55,
                    pointerEvents: isUnlocked ? "auto" : "none",
                    userSelect: isUnlocked ? "auto" : "none",
                    transition: "filter 180ms ease, opacity 180ms ease",
                }}
            >
                {children}
            </div>

            {!isUnlocked && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        padding: 12,
                    }}
                >
                    <IonCard style={{ width: "min(520px, 95%)" }}>
                        <IonCardContent>
                            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                                Privacy check
                            </div>
                            <div style={{ opacity: 0.8, marginBottom: 12 }}>
                                This section contains sensitive client data. Confirm you are in a private space before viewing.
                            </div>

                            <IonItem lines="none">
                                <IonCheckbox
                                    checked={checked}
                                    onIonChange={(e) => setChecked(!!e.detail.checked)}
                                />
                                <IonLabel style={{ marginLeft: 12 }}>
                                    I confirm I’m in a private space.
                                </IonLabel>
                            </IonItem>

                            <IonButton
                                expand="block"
                                disabled={!checked}
                                className="ion-margin-top"
                                onClick={unlock}
                            >
                                Unlock (for {minutes} min)
                            </IonButton>

                            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
                                Unlock expires automatically.
                            </div>
                        </IonCardContent>
                    </IonCard>
                </div>
            )}
        </div>
    );
};

export default PrivacyGate;