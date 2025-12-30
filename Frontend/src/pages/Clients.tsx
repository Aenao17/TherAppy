import "./css/Clients.css"

import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonItem,
    IonLabel,
    IonList,
    IonFooter,
    IonButton,
    IonLoading,
    IonToast,
} from "@ionic/react";

import { useEffect, useMemo, useState } from "react";
import { getMyClients, PsychClient } from "../api/psychologistClients";
import PanicButton from "../components/PanicButton";

import PrivacyGate from "../components/PrivacyGate";
import ClientEmotionLogsWidget from "../components/ClientEmotionLogsWidget";
import ClientMoodChartWidget from "../components/ClientMoodChartWidget";
import PsychologistToolbar from "../components/PsychologistToolbar";
import { useIonRouter } from "@ionic/react";
import {getJsonAuth} from "../api/api";
import {clearTokens} from "../auth/authStorage";
import PsychologistMaterialsWidget from "../components/PsychologistMaterialsWidget";

const PAGE_SIZE = 10;

const Clients: React.FC = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);

    const [items, setItems] = useState<PsychClient[]>([]);
    const [totalPages, setTotalPages] = useState(0);

    const [selected, setSelected] = useState<PsychClient | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [inboxCount, setInboxCount] = useState(0);
    const router = useIonRouter();

    const canPrev = page > 0;
    const canNext = page + 1 < totalPages;

    const normalizedSearch = useMemo(() => search.trim(), [search]);

    const load = async (p: number, s: string) => {
        setIsLoading(true);
        try {
            const resp = await getMyClients({ page: p, size: PAGE_SIZE, search: s });
            setItems(resp.items);
            setTotalPages(resp.totalPages);

            // dacă item-ul selectat nu mai e în pagină, îl păstrăm selectat (ok)
            // dar dacă vrei să îl resetăm când se schimbă pagina, zici și schimbăm
        } catch {
            setErrorMessage("Failed to load clients");
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    // load when page/search changes
    useEffect(() => {
        load(page, normalizedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, normalizedSearch]);

    const loadInbox = async () => {
        return await getJsonAuth<InboxResponse>("/api/onboarding/inbox");
    };

    type InboxResponse = { requests: { id: number }[] };
    const refreshInboxCount = async () => {
        const resp = await getJsonAuth<InboxResponse>("/api/onboarding/inbox");
        setInboxCount(resp.requests.length);
    };

    const handleLogout = () => {
        clearTokens();
        router.push("/login", "root");
    };

    useEffect(() => {
        // fetch inbox count
        (async () => {

                try {
                    await refreshInboxCount();
                } catch {
                    // nu blocăm UX-ul dacă count-ul pică
                    setInboxCount(0);
                }
        })();
    }, []);


    return (
        <IonPage>
            <IonHeader>
                <PsychologistToolbar
                    title="My Clients"
                    inboxCount={inboxCount}
                    onOpenInbox={() => router.push("/inbox", "forward")}
                    onLogout={handleLogout}
                />
            </IonHeader>


            <IonContent className="ion-padding">
                <IonSearchbar
                    value={search}
                    debounce={350}
                    placeholder="Search clients by username"
                    onIonInput={(e) => {
                        setSearch(e.detail.value ?? "");
                        setPage(0); // reset pagination on new search
                    }}
                />

                <IonList>
                    {items.map((c) => (
                        <IonItem
                            key={c.id}
                            button
                            onClick={() => setSelected(c)}
                            color={selected?.id === c.id ? "light" : undefined}
                        >
                            <IonLabel>
                                <div className="client-username">@{c.username}</div>
                                <div className="client-id">id: {c.id}</div>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>

                <div className="clients-details">
                {selected ? (
                        <>
                            <h2>@{selected.username}</h2>

                            <PrivacyGate minutes={15}>
                                <div className="profile-grid">
                                    <ClientMoodChartWidget clientId={selected.id} />
                                    <ClientEmotionLogsWidget clientId={selected.id} />
                                    <PsychologistMaterialsWidget clientId={selected.id} />
                                </div>
                            </PrivacyGate>
                        </>
                    ) : (
                    <p className="clients-empty">Select a client to view details.</p>
                    )}
                </div>

                <IonLoading isOpen={isLoading} message="Loading..." />
                <IonToast
                    isOpen={showError}
                    message={errorMessage}
                    duration={2200}
                    onDidDismiss={() => setShowError(false)}
                />
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    <IonButton disabled={!canPrev || isLoading} onClick={() => setPage((p) => p - 1)}>
                        Previous
                    </IonButton>

                    <IonLabel style={{ marginLeft: 12, opacity: 0.7 }}>
                        Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
                    </IonLabel>

                    <IonButton slot="end" disabled={!canNext || isLoading} onClick={() => setPage((p) => p + 1)}>
                        Next
                    </IonButton>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
};

export default Clients;