import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToast,
    IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { getJsonAuth, postJsonAuth } from "../api/api";
import { getRole } from "../auth/jwt";
import { useIonRouter } from "@ionic/react";

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

const Inbox: React.FC = () => {
    const router = useIonRouter();
    const role = getRole();

    const [isLoading, setIsLoading] = useState(true);
    const [inbox, setInbox] = useState<InboxItem[]>([]);

    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const loadInbox = async () => {
        const resp = await getJsonAuth<InboxResponse>("/api/onboarding/inbox");
        setInbox(resp.requests);
    };

    useEffect(() => {
        (async () => {
            // Extra guard in UI (backend is still the real protection)
            if (role !== "ADMIN" && role !== "PSYCHOLOGIST") {
                router.push("/home", "root");
                return;
            }

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
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const approveRequest = async (id: number) => {
        setIsLoading(true);
        try {
            await postJsonAuth<void>(`/api/onboarding/${id}/approve`, {});
            setSuccessMessage("Approved. The user's role changed. They should log in again.");
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
            setSuccessMessage("Rejected.");
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

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Inbox</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Pending requests</IonCardTitle>
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
                                            <div style={{ opacity: 0.7, fontSize: 12 }}>
                                                {new Date(r.createdAt).toLocaleString()}
                                            </div>
                                        </IonLabel>

                                        <IonButtons slot="end">
                                            <IonButton
                                                size="small"
                                                onClick={() => approveRequest(r.id)}
                                                disabled={isLoading}
                                            >
                                                Approve
                                            </IonButton>
                                            <IonButton
                                                size="small"
                                                color="danger"
                                                onClick={() => rejectRequest(r.id)}
                                                disabled={isLoading}
                                            >
                                                Reject
                                            </IonButton>
                                        </IonButtons>
                                    </IonItem>
                                ))}
                            </IonList>
                        )}
                    </IonCardContent>
                </IonCard>

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
                    duration={2200}
                    onDidDismiss={() => setShowSuccess(false)}
                />
            </IonContent>
        </IonPage>
    );
};

export default Inbox;