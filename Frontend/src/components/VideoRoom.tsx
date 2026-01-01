import React, { useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

interface VideoRoomProps {
    roomName: string;
    displayName: string;
    jwt: string;
    onClose: () => void;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

function getTenantFromToken(token: string): string | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        // La 8x8, 'sub' este AppID-ul (ex: vpaas-magic-cookie-...)
        return payload.sub || null;
    } catch (e) {
        console.error("Nu am putut extrage Tenant-ul din JWT", e);
        return null;
    }
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomName, displayName, jwt, onClose }) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);

    useEffect(() => {
        if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current || !jwt) return;

        const tenant = getTenantFromToken(jwt);
        if (!tenant) {
            console.error("Token invalid: lipsește AppID (sub)");
            return;
        }
        const fullRoomName = `${tenant}/${roomName}`;

        console.log("Connecting to JaaS Room:", fullRoomName); // Debugging

        const domain = '8x8.vc';
        const options = {
            roomName: fullRoomName, // UUID-ul camerei
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            jwt: jwt, // <--- AICI PREDĂM "BILETUL" DE INTRARE
            userInfo: {
                displayName: displayName
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                prejoinPageEnabled: false,
                disableDeepLinking: true,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'hangup', 'tileview', 'raisehand',
                    'chat', 'desktop'
                ],
                SHOW_JITSI_WATERMARK: false,
                SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
                SHOW_BRAND_WATERMARK: false,
                SHOW_POWERED_BY: false,
            }
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        apiRef.current.addEventListeners({
            videoConferenceLeft: () => {
                onClose();
            },
            errorOccurred: (e: any) => {
                console.error("Jitsi Error:", e);
            }
        });

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, [roomName, displayName, jwt, onClose]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="danger">
                    <IonTitle>Urgență: Conexiune Activă</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div
                    ref={jitsiContainerRef}
                    style={{ height: '100%', width: '100%', background: '#000' }}
                />
            </IonContent>
        </IonPage>
    );
};

export default VideoRoom;