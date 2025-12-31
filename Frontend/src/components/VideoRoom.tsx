import React, { useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

interface VideoRoomProps {
    roomName: string;
    displayName: string;
    onClose: () => void;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomName, displayName, onClose }) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);

    useEffect(() => {
        if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current) return;

        const domain = 'meet.jit.si';
        // const options = {
        //     roomName: `therappy-secure-${roomName}`,
        //     width: '100%',
        //     height: '100%',
        //     parentNode: jitsiContainerRef.current,
        //     userInfo: {
        //         displayName: displayName
        //     },
        //     configOverwrite: {
        //         startWithAudioMuted: false,
        //         startWithVideoMuted: false,
        //         prejoinPageEnabled: false
        //     },
        //     interfaceConfigOverwrite: {
        //         TOOLBAR_BUTTONS: [
        //             'microphone', 'camera', 'hangup', 'tileview'
        //         ],
        //         SHOW_JITSI_WATERMARK: false,
        //         SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        //     }
        // };
        const options = {
            roomName: `therappy-secure-${roomName}`,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: displayName
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                prejoinPageEnabled: false,
                disableDeepLinking: true, // <--- IMPORTANT: Nu cere aplicația mobilă
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'hangup', 'tileview', 'raisehand'
                ],
                SHOW_JITSI_WATERMARK: false,
                SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                // Ascundem opțiunile avansate care ar putea confuza
                SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
            }
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // apiRef.current.addEventListeners({
        //     videoConferenceLeft: () => {
        //         onClose();
        //     },
        // });

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, [roomName, displayName, onClose]);

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