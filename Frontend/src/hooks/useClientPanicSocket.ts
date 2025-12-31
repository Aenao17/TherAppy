import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { getDecodedToken } from "../auth/authStorage";

export type PanicAckEvent = {
    alertId: number;
    withVideo: boolean;
    psychologistUsername: string;
    videoRoomId: string;
};

export function useClientPanicSocket(
    onAck: (e: PanicAckEvent) => void
) {
    const clientRef = useRef<Stomp.Client | null>(null);

    useEffect(() => {
        // Luăm username-ul direct din token-ul stocat
        const token = getDecodedToken();
        const username = token?.sub;

        if (!username) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const client = Stomp.over(socket);

        client.debug = () => {}; // Oprim logurile din consolă

        client.connect({}, () => {
            // Ascultăm pe canalul personalizat al clientului
            client.subscribe(
                `/topic/panic-updates/${username}`,
                (msg) => {
                    const data = JSON.parse(msg.body) as PanicAckEvent;
                    onAck(data);
                }
            );
        });

        clientRef.current = client;

        return () => {
            if (clientRef.current?.connected) {
                clientRef.current.disconnect(() => {});
            }
        };
    }, [onAck]);
}