import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList } from "@ionic/react";
import { useEffect, useState } from "react";
import { downloadUrl, listMyMaterials, MaterialItem } from "../api/materials";

const ClientMaterialsWidget: React.FC = () => {
    const [items, setItems] = useState<MaterialItem[]>([]);

    useEffect(() => {
        listMyMaterials().then(setItems).catch(() => setItems([]));
    }, []);

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>Materials</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                {items.length === 0 ? (
                    <div style={{ opacity: 0.7 }}>No materials yet.</div>
                ) : (
                    <IonList>
                        {items.map((m) => (
                            <IonItem key={m.id}>
                                <IonLabel>
                                    <div><b>{m.filename}</b></div>
                                    <div style={{ opacity: 0.7, fontSize: 12 }}>
                                        {Math.round(m.sizeBytes / 1024)} KB · {new Date(m.uploadedAt).toLocaleString()}
                                    </div>
                                </IonLabel>

                                <IonButton
                                    slot="end"
                                    fill="outline"
                                    onClick={() => downloadUrl(m.id)}
                                >
                                    Download
                                </IonButton>
                            </IonItem>
                        ))}
                    </IonList>
                )}
            </IonCardContent>
        </IonCard>
    );
};

export default ClientMaterialsWidget;