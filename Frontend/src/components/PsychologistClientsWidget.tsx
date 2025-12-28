import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from "@ionic/react";
import { peopleOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";

const PsychologistClientsWidget: React.FC = () => {
    const router = useIonRouter();

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <IonIcon icon={peopleOutline} />
            Clients
          </span>
                </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
                <div style={{ opacity: 0.8, marginBottom: 12 }}>
                    View and manage your clients.
                </div>

                <IonButton expand="block" onClick={() => router.push("/clients", "forward")}>
                    Open clients
                </IonButton>
            </IonCardContent>
        </IonCard>
    );
};

export default PsychologistClientsWidget;