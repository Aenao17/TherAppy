import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { downloadUrl, listClientMaterials, MaterialItem, uploadClientMaterial } from "../api/materials";
import { deleteMaterial } from "../api/materials";
import { IonAlert } from "@ionic/react";


type Props = { clientId: number };

const PsychologistMaterialsWidget: React.FC<Props> = ({ clientId }) => {
    const [items, setItems] = useState<MaterialItem[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);


    const load = async () => {
        const data = await listClientMaterials(clientId);
        setItems(data);
    };

    useEffect(() => { load().catch(() => setItems([])); }, [clientId]);

    const pick = () => inputRef.current?.click();

    const onFile = async (file: File) => {
        setIsUploading(true);
        try {
            await uploadClientMaterial(clientId, file);
            await load();
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>Educational materials</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onFile(f);
                        e.currentTarget.value = "";
                    }}
                />

                <IonButton expand="block" onClick={pick} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload PDF / Word"}
                </IonButton>

                <div style={{ height: 12 }} />

                {items.length === 0 ? (
                    <div style={{ opacity: 0.7 }}>No materials uploaded yet.</div>
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

                                <IonButton slot="end" fill="outline" onClick={() => downloadUrl(m.id)}>
                                    Download
                                </IonButton>
                                <IonButton
                                    slot="end"
                                    color="danger"
                                    fill="outline"
                                    onClick={() => setToDeleteId(m.id)}
                                >
                                    Delete
                                </IonButton>
                            </IonItem>
                        ))}
                    </IonList>
                )}
            </IonCardContent>
            <IonAlert
                isOpen={toDeleteId !== null}
                header="Delete material?"
                message="This will permanently remove the file for this client."
                onDidDismiss={() => setToDeleteId(null)}
                buttons={[
                    { text: "Cancel", role: "cancel" },
                    {
                        text: "Delete",
                        role: "destructive",
                        handler: async () => {
                            if (toDeleteId == null) return;
                            const id = toDeleteId;
                            setToDeleteId(null);
                            await deleteMaterial(id);
                            await load(); // refresh list
                        },
                    },
                ]}
            />
        </IonCard>

    );
};

export default PsychologistMaterialsWidget;