import {
    IonButton, IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { useMemo } from "react";
import { getRole } from "../auth/jwt";
import { useIonRouter } from "@ionic/react";
import {
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonNote,
    IonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { getJsonAuth, postJsonAuth } from "../api/api";
import {clearTokens} from "../auth/authStorage";


const Home: React.FC = () => {
    const router = useIonRouter();
    const role = useMemo(() => getRole(), []);
    type InboxItem = {
        id: number; // Integer in backend
        requesterUsername: string;
        targetUsername: string;
        type: string;
        status: string;
        createdAt: string;
    };

    type InboxResponse = {
        requests: InboxItem[];
    };

    const [psychologistUsername, setPsychologistUsername] = useState("");
    const [adminUsername, setAdminUsername] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const [inbox, setInbox] = useState<InboxItem[]>([]);

    const loadInbox = async () => {
        const resp = await getJsonAuth<InboxResponse>("/api/onboarding/inbox");
        setInbox(resp.requests);
    };

    useEffect(() => {
        (async () => {
            if (role === "ADMIN" || role === "PSYCHOLOGIST") {
                try {
                    setIsLoading(true);
                    await loadInbox();
                } catch (e) {
                    const msg = e instanceof Error ? e.message : "Failed to load inbox";
                    setErrorMessage(msg);
                    setShowError(true);
                } finally {
                    setIsLoading(false);
                }
            }
        })();
    }, [role]);

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
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Request failed";
            setErrorMessage(msg);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const approveRequest = async (id: number) => {
        setIsLoading(true);
        try {
            await postJsonAuth<void>(`/api/onboarding/${id}/approve`, {});
            setSuccessMessage("Request approved.");
            setShowSuccess(true);
            await loadInbox();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Approve failed";
            setErrorMessage(msg);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const rejectRequest = async (id: number) => {
        setIsLoading(true);
        try {
            await postJsonAuth<void>(`/api/onboarding/${id}/reject`, {});
            setSuccessMessage("Request rejected.");
            setShowSuccess(true);
            await loadInbox();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Reject failed";
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
                <IonToolbar>
                    <IonTitle>Home</IonTitle>
                    <IonButton slot="end" fill="clear" onClick={handleLogout}>
                        Logout
                    </IonButton>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Current role</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {role ?? "Unknown"}
                    </IonCardContent>
                </IonCard>

                {role === "USER" && (
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Finish setup</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <p>
                                Your account is currently <b>USER</b>. To use the platform, you must be added as a <b>CLIENT</b> or approved as a <b>PSYCHOLOGIST</b>.
                            </p>

                            <IonItem>
                                <IonLabel position="stacked">Become a CLIENT</IonLabel>
                                <IonInput
                                    value={psychologistUsername}
                                    onIonInput={(e) => setPsychologistUsername(e.detail.value ?? "")}
                                    placeholder="Psychologist username"
                                    disabled={isLoading}
                                />
                            </IonItem>
                            <IonButton
                                expand="block"
                                onClick={requestClient}
                                disabled={isLoading || psychologistUsername.trim().length < 3}
                                className="ion-margin-top"
                            >
                                Request Client Access
                            </IonButton>

                            <div style={{ height: 16 }} />

                            <IonItem>
                                <IonLabel position="stacked">Become a PSYCHOLOGIST</IonLabel>
                                <IonInput
                                    value={adminUsername}
                                    onIonInput={(e) => setAdminUsername(e.detail.value ?? "")}
                                    placeholder="Admin username"
                                    disabled={isLoading}
                                />
                            </IonItem>
                            <IonButton
                                expand="block"
                                onClick={requestPsychologist}
                                disabled={isLoading || adminUsername.trim().length < 3}
                                className="ion-margin-top"
                            >
                                Request Psychologist Approval
                            </IonButton>

                            <IonNote>
                                After approval, please log out and log in again to refresh your role.
                            </IonNote>
                        </IonCardContent>
                    </IonCard>

                )}

                {role === "CLIENT" && (
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Client area</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            Client home page (coming next).
                        </IonCardContent>
                    </IonCard>
                )}

                {role === "PSYCHOLOGIST" && (
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Inbox</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {inbox.length === 0 ? (
                                <div>No pending requests.</div>
                            ) : (
                                <IonList>
                                    {inbox.map((r) => (
                                        <IonItem key={r.id}>
                                            <IonLabel>
                                                <div><b>{r.requesterUsername}</b></div>
                                                <div>Type: {r.type}</div>
                                                <div>Target: {r.targetUsername}</div>
                                            </IonLabel>

                                            <IonLabel>
                                                <div><b>{r.requesterUsername}</b></div>
                                                <div>Type: {r.type}</div>
                                                <div style={{ opacity: 0.7, fontSize: 12 }}>
                                                    {new Date(r.createdAt).toLocaleString()}
                                                </div>
                                            </IonLabel>

                                            <IonButtons slot="end">
                                                <IonButton size="small" onClick={() => approveRequest(r.id)} disabled={isLoading}>
                                                    Approve
                                                </IonButton>
                                                <IonButton size="small" color="danger" onClick={() => rejectRequest(r.id)} disabled={isLoading}>
                                                    Reject
                                                </IonButton>
                                            </IonButtons>
                                        </IonItem>
                                    ))}
                                </IonList>
                            )}
                        </IonCardContent>
                    </IonCard>
                )}

                {role === "ADMIN" && (
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Admin area</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonButton expand="block" onClick={() => router.push("/admin", "forward")}>
                                Open Admin Dashboard
                            </IonButton>
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle>Inbox</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    {inbox.length === 0 ? (
                                        <div>No pending requests.</div>
                                    ) : (
                                        <IonList>
                                            {inbox.map((r) => (
                                                <IonItem key={r.id}>
                                                    <IonLabel>
                                                        <div><b>{r.requesterUsername}</b></div>
                                                        <div>Type: {r.type}</div>
                                                        <div>Target: {r.targetUsername}</div>
                                                    </IonLabel>

                                                    <IonLabel>
                                                        <div><b>{r.requesterUsername}</b></div>
                                                        <div>Type: {r.type}</div>
                                                        <div style={{ opacity: 0.7, fontSize: 12 }}>
                                                            {new Date(r.createdAt).toLocaleString()}
                                                        </div>
                                                    </IonLabel>

                                                    <IonButtons slot="end">
                                                        <IonButton size="small" onClick={() => approveRequest(r.id)} disabled={isLoading}>
                                                            Approve
                                                        </IonButton>
                                                        <IonButton size="small" color="danger" onClick={() => rejectRequest(r.id)} disabled={isLoading}>
                                                            Reject
                                                        </IonButton>
                                                    </IonButtons>

                                                </IonItem>
                                            ))}
                                        </IonList>
                                    )}
                                </IonCardContent>
                            </IonCard>
                        </IonCardContent>
                    </IonCard>
                )}
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
            </IonContent>
        </IonPage>
    );
};

export default Home;