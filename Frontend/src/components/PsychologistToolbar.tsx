import {IonBadge, IonButton, IonButtons, IonIcon, IonTitle, IonToolbar, useIonRouter} from "@ionic/react";
import {mailOutline, logOutOutline, homeOutline} from "ionicons/icons";

type Props = {
    title: string;
    inboxCount: number;
    onOpenInbox: () => void;
    onLogout: () => void;
};

const PsychologistToolbar: React.FC<Props> = ({ title, inboxCount, onOpenInbox, onLogout }) => {
    const router = useIonRouter();
    return (
        <IonToolbar>
            <IonTitle slot="start">{title}</IonTitle>


            <IonButtons slot="end">
                <IonButton onClick={() => router.push("/home", "root")} title="Home" aria-label="Home">
                    <IonIcon icon={homeOutline} />
                </IonButton>
                <IonButton onClick={onOpenInbox} title="Inbox" aria-label="Inbox">
                    <IonIcon icon={mailOutline} />
                    {inboxCount > 0 && (
                        <IonBadge
                            style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                fontSize: 10,
                                padding: "2px 6px",
                                borderRadius: 999,
                            }}
                        >
                            {inboxCount}
                        </IonBadge>
                    )}
                </IonButton>

                <IonButton onClick={onLogout} title="Logout" aria-label="Logout">
                    <IonIcon icon={logOutOutline} />
                </IonButton>
            </IonButtons>
        </IonToolbar>
    );
};

export default PsychologistToolbar;
