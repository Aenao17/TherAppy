import "./css/Home.css";

// ✅ Tema globală (same as Login/Signup)
import "./css/base.css";
import "./css/layout.css";
import "./css/forms.css";
import "./css/cards.css";
import "./css/lists.css";
import "./css/utilities.css";

import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInput,
    IonItem,
    IonLabel,
    IonLoading,
    IonNote,
    IonToast,
} from "@ionic/react";

import { useEffect, useMemo, useState } from "react";
import { useIonRouter, useIonViewWillEnter } from "@ionic/react";
import { getRole, getUsername } from "../auth/jwt";
import { getJsonAuth, postJsonAuth } from "../api/api";
import { clearTokens } from "../auth/authStorage";

import EmotionLogWidget from "../components/EmotionLogWidget";
import MoodThermometerWidget from "../components/MoodThermometerWidget";
import PsychologistClientsWidget from "../components/PsychologistClientsWidget";
import PsychologistToolbar from "../components/PsychologistToolbar";
import PanicButton from "../components/PanicButton";
import PanicAlarmOverlay from "../components/PanicAlarmOverlay";
import { usePanicSocket, PanicEvent } from "../hooks/usePanicSocket";

const Home: React.FC = () => {
    const router = useIonRouter();
    const role = useMemo(() => getRole(), []);

    type InboxItem = {
        id: number;
        requesterUsername: string;
        targetUsername: string;
        type: string;
        status: string;
        createdAt: string;
    };

    const [psychologistUsername, setPsychologistUsername] = useState("");
    const [adminUsername, setAdminUsername] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    // (păstrat - nu-l folosești direct acum, dar nu stric)
    const [inbox, setInbox] = useState<InboxItem[]>([]);
    const [panicEvent, setPanicEvent] = useState<PanicEvent | null>(null);

    const [inboxCount, setInboxCount] = useState(0);

    type InboxResponse = { requests: { id: number }[] };

    const refreshInboxCount = async () => {
        const resp = await getJsonAuth<InboxResponse>("/api/onboarding/inbox");
        setInboxCount(resp.requests.length);
    };

    useIonViewWillEnter(() => {
        if (role === "ADMIN" || role === "PSYCHOLOGIST") {
            refreshInboxCount().catch(() => setInboxCount(0));
        }
    });

    useEffect(() => {
        (async () => {
            if (role === "ADMIN" || role === "PSYCHOLOGIST") {
                try {
                    await refreshInboxCount();
                } catch {
                    setInboxCount(0);
                }
            } else {
                setInboxCount(0);
            }
        })();
    }, [role]);

    usePanicSocket(role === "PSYCHOLOGIST" ? getUsername() : null, (event) => {
        setPanicEvent(event);
    });

    const requestClient = async () => {
        const t = psychologistUsername.trim();
        if (t.length < 3) {
            setErrorMessage("Please enter your psychologist's username.");
            setShowError(true);
            return;
        }
        setIsLoading(true);
        try {
            await postJsonAuth<void>("/api/onboarding/request-client", { targetUsername: t });
            setSuccessMessage("Request sent to psychologist. Wait for approval.");
            setShowSuccess(true);
            setPsychologistUsername("");
            setTimeout(() => {
                handleLogout();
            }, 2100);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Request failed";
            setErrorMessage(msg);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const requestPsychologist = async () => {
        const t = adminUsername.trim();
        if (t.length < 3) {
            setErrorMessage("Please enter an admin username.");
            setShowError(true);
            return;
        }
        setIsLoading(true);
        try {
            await postJsonAuth<void>("/api/onboarding/request-psychologist", { targetUsername: t });
            setSuccessMessage("Request sent to admin. Wait for approval.");
            setShowSuccess(true);
            setAdminUsername("");
            setTimeout(() => {
                handleLogout();
            }, 2100);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Request failed";
            setErrorMessage(msg);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        clearTokens();
        router.push("/login", "root");
    };

    return (
        <IonPage>
            <IonHeader>
                {role === "ADMIN" || role === "PSYCHOLOGIST" ? (
                    <PsychologistToolbar
                        title="Home"
                        inboxCount={inboxCount}
                        onOpenInbox={() => router.push("/inbox", "forward")}
                        onLogout={handleLogout}
                    />
                ) : (
                    <IonToolbar className="app-toolbar">
                        <IonTitle>Home</IonTitle>
                        <IonButtons slot="end">
                            <IonButton fill="clear" onClick={handleLogout}>
                                Logout
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                )}
            </IonHeader>

            {/* ✅ Responsive container (no ion-padding) */}
            <IonContent className="home-page">
                <div className="app-shell">
                    {/* Header section */}
                    <div className="home-hero">
                        <div className="home-hero-text">
                            <h2 className="home-title">Welcome</h2>
                            <p className="home-subtitle">Your workspace adapts to your role.</p>
                        </div>

                        <div className={`role-pill role-${(role ?? "unknown").toLowerCase()}`}>
                            <span className="role-pill-label">Role</span>
                            <span className="role-pill-value">{role ?? "Unknown"}</span>
                        </div>
                    </div>

                    {role === "USER" && (
                        <IonCard className="ui-card home-card">
                            <IonCardHeader>
                                <IonCardTitle>Finish setup</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <p className="home-paragraph">
                                    Your account is currently <b>USER</b>. To use the platform, you must be added as a{" "}
                                    <b>CLIENT</b> or approved as a <b>PSYCHOLOGIST</b>.
                                </p>

                                <div className="home-grid-2">
                                    <div className="home-panel">
                                        <div className="home-panel-title">Become a CLIENT</div>

                                        <IonItem lines="none" className="form-item">
                                            <IonLabel position="stacked">Psychologist username</IonLabel>
                                            <IonInput
                                                value={psychologistUsername}
                                                onIonInput={(e) => setPsychologistUsername(e.detail.value ?? "")}
                                                placeholder="e.g. dr_andrei"
                                                disabled={isLoading}
                                                className="form-input"
                                            />
                                        </IonItem>

                                        <IonButton
                                            expand="block"
                                            className="primary-button"
                                            onClick={requestClient}
                                            disabled={isLoading || psychologistUsername.trim().length < 3}
                                        >
                                            Request Client Access
                                        </IonButton>
                                    </div>

                                    <div className="home-panel">
                                        <div className="home-panel-title">Become a PSYCHOLOGIST</div>

                                        <IonItem lines="none" className="form-item">
                                            <IonLabel position="stacked">Admin username</IonLabel>
                                            <IonInput
                                                value={adminUsername}
                                                onIonInput={(e) => setAdminUsername(e.detail.value ?? "")}
                                                placeholder="e.g. admin_ion"
                                                disabled={isLoading}
                                                className="form-input"
                                            />
                                        </IonItem>

                                        <IonButton
                                            expand="block"
                                            className="primary-button"
                                            onClick={requestPsychologist}
                                            disabled={isLoading || adminUsername.trim().length < 3}
                                        >
                                            Request Psychologist Approval
                                        </IonButton>
                                    </div>
                                </div>

                                <IonNote className="home-note">
                                    After approval, please log out and log in again to refresh your role.
                                </IonNote>
                            </IonCardContent>
                        </IonCard>
                    )}

                    {role === "CLIENT" && (
                        <IonCard className="ui-card home-card">
                            <IonCardHeader>
                                <IonCardTitle>Quick logging</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className="client-grid">
                                    <EmotionLogWidget />
                                    <MoodThermometerWidget />
                                </div>
                            </IonCardContent>
                        </IonCard>
                    )}

                    {role === "PSYCHOLOGIST" && (
                        <IonCard className="ui-card home-card">
                            <IonCardHeader>
                                <IonCardTitle>Dashboard</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <PsychologistClientsWidget />
                            </IonCardContent>
                        </IonCard>
                    )}

                    {role === "ADMIN" && (
                        <IonCard className="ui-card home-card">
                            <IonCardHeader>
                                <IonCardTitle>Admin area</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className="home-actions">
                                    <IonButton
                                        expand="block"
                                        className="primary-button"
                                        onClick={() => router.push("/admin", "forward")}
                                    >
                                        Open Admin Dashboard
                                    </IonButton>

                                    <IonButton
                                        expand="block"
                                        className="secondary-button"
                                        onClick={() => router.push("/inbox", "forward")}
                                        disabled={isLoading}
                                    >
                                        Open Inbox
                                        {inboxCount > 0 && <span className="inbox-badge">{inboxCount}</span>}
                                    </IonButton>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    )}
                </div>

                <IonLoading isOpen={isLoading} message="Please wait..." />

                <IonToast
                    isOpen={showError}
                    message={errorMessage}
                    duration={2500}
                    onDidDismiss={() => setShowError(false)}
                />

                <IonToast
                    isOpen={showSuccess}
                    message={successMessage}
                    duration={2000}
                    onDidDismiss={() => setShowSuccess(false)}
                />

                <IonToast
                    isOpen={!!panicEvent}
                    message={panicEvent ? `🚨 PANIC ALERT from @${panicEvent.clientUsername}` : ""}
                    duration={0}
                    buttons={[
                        {
                            text: "Acknowledge",
                            handler: () => setPanicEvent(null),
                        },
                    ]}
                    color="danger"
                />
            </IonContent>

            {/* ✅ Panic button fixed, one-tap, safe-area */}
            <div className="panic-fab">
                <PanicButton enabled={role === "CLIENT"} />
            </div>

            <PanicAlarmOverlay event={panicEvent} onClose={() => setPanicEvent(null)} />
        </IonPage>
    );
};

export default Home;
