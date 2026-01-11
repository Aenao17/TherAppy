import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { BASE_URL } from "../api/api";

export type PanicEvent = {
    alertId: number;
    clientUsername: string;
    triggeredByLongPress: boolean;
    createdAt: string;
    videoRoomId: string;
    jitsiToken: string;
};

export function usePanicSocket(
    psychologistUsername: string | null,
    onEvent: (e: PanicEvent) => void
) {
    const clientRef = useRef<Stomp.Client | null>(null);

    useEffect(() => {
        if (!psychologistUsername) return;

        const socket = new SockJS(`${BASE_URL}/ws`);
        const client = Stomp.over(socket);

        client.debug = () => {}; // silence logs

        client.connect({}, () => {
            console.log("Psychologist panic socket connected to " + BASE_URL)
            client.subscribe(
                `/topic/panic/${psychologistUsername}`,
                (msg) => {
                    const data = JSON.parse(msg.body) as PanicEvent;
                    onEvent(data);
                }
            );
        }, (error)=> {
            console.error("Psychologist panic socket connection error:", error);
        });

        clientRef.current = client;

        return () => {
            if (clientRef.current?.connected) {
                clientRef.current.disconnect(() => {});
            }
        };
    }, [psychologistUsername, onEvent]);
}