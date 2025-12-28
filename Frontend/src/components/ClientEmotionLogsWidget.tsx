import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { EmotionItem, getClientEmotions } from "../api/clientProfile";

type Props = { clientId: number };

const ClientEmotionLogsWidget: React.FC<Props> = ({ clientId }) => {
    const [items, setItems] = useState<EmotionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        getClientEmotions(clientId)
            .then((data) => mounted && setItems(data))
            .catch(() => mounted && setShowError(true))
            .finally(() => mounted && setIsLoading(false));
        return () => {
            mounted = false;
        };
    }, [clientId]);

    return (
        <>
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Emotion logs</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    {items.length === 0 ? (
                        <div style={{ opacity: 0.7 }}>No logs yet.</div>
                    ) : (
                        <IonList>
                            {items.map((i) => (
                                <IonItem key={i.id}>
                                    <IonLabel>
                                        <div style={{ fontSize: 12, opacity: 0.6 }}>
                                            {new Date(i.createdAt).toLocaleString()}
                                        </div>
                                        <div>{i.text}</div>
                                    </IonLabel>
                                </IonItem>
                            ))}
                        </IonList>
                    )}
                </IonCardContent>
            </IonCard>

            <IonLoading isOpen={isLoading} message="Loading logs..." />
            <IonToast
                isOpen={showError}
                message="Failed to load emotion logs"
                duration={2000}
                onDidDismiss={() => setShowError(false)}
            />
        </>
    );
};

export default ClientEmotionLogsWidget;