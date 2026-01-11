import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { getDecodedToken } from "../auth/authStorage";
import { BASE_URL } from "../api/api";

export type PanicAckEvent = {
    alertId: number;
    withVideo: boolean;
    psychologistUsername: string;
    videoRoomId: string;
    jitsiToken: string;
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

        const socket = new SockJS(`${BASE_URL}/ws`);
        const client = Stomp.over(socket);

        client.debug = () => {}; // Oprim logurile din consolă

        client.connect({}, () => {
            // Ascultăm pe canalul personalizat al clientului
            console.log("Client panic socket connected to " + BASE_URL);
            client.subscribe(
                `/topic/panic-updates/${username}`,
                (msg) => {
                    const data = JSON.parse(msg.body) as PanicAckEvent;
                    onAck(data);
                }
            );
        }, (error)=> {
            console.error("Client panic socket connection error:", error);
        });

        clientRef.current = client;

        return () => {
            if (clientRef.current?.connected) {
                clientRef.current.disconnect(() => {});
            }
        };
    }, [onAck]);
}