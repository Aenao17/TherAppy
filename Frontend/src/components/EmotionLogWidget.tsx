import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonTextarea,
    IonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { createEmotion, getEmotions, EmotionLogItem } from "../api/emotions";

const EmotionLogWidget: React.FC = () => {
    const [text, setText] = useState("");
    const [items, setItems] = useState<EmotionLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const load = async () => {
        const data = await getEmotions();
        setItems(data);
    };

    useEffect(() => {
        load().catch(() => {
            setErrorMessage("Failed to load emotion logs");
            setShowError(true);
        });
    }, []);

    const save = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setIsLoading(true);
        try {
            await createEmotion(trimmed);
            setText("");
            setSuccessMessage("Saved");
            setShowSuccess(true);
            await load();
        } catch {
            setErrorMessage("Failed to save");
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Emotion Log</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonTextarea
                        placeholder="Write your thoughts..."
                        value={text}
                        autoGrow
                        rows={5}
                        onIonInput={(e) => setText(e.detail.value ?? "")}
                        disabled={isLoading}
                    />

                    <IonButton
                        expand="block"
                        className="ion-margin-top"
                        onClick={save}
                        disabled={isLoading || text.trim().length === 0}
                    >
                        Save
                    </IonButton>

                    <div style={{ marginTop: 16, fontWeight: 600 }}>Previous entries</div>

                    {items.length === 0 ? (
                        <div style={{ marginTop: 8, opacity: 0.7 }}>No entries yet.</div>
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

            <IonLoading isOpen={isLoading} message="Please wait..." />
            <IonToast
                isOpen={showError}
                message={errorMessage}
                duration={2200}
                onDidDismiss={() => setShowError(false)}
            />
            <IonToast
                isOpen={showSuccess}
                message={successMessage}
                duration={1200}
                onDidDismiss={() => setShowSuccess(false)}
            />
        </>
    );
};

export default EmotionLogWidget;