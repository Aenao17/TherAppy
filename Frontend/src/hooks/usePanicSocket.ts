import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export type PanicEvent = {
    alertId: number;
    clientUsername: string;
    triggeredByLongPress: boolean;
    createdAt: string;
};

export function usePanicSocket(
    psychologistUsername: string | null,
    onEvent: (e: PanicEvent) => void
) {
    const clientRef = useRef<Stomp.Client | null>(null);

    useEffect(() => {
        if (!psychologistUsername) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const client = Stomp.over(socket);

        client.debug = () => {}; // silence logs

        client.connect({}, () => {
            client.subscribe(
                `/topic/panic/${psychologistUsername}`,
                (msg) => {
                    const data = JSON.parse(msg.body) as PanicEvent;
                    onEvent(data);
                }
            );
        });

        clientRef.current = client;

        return () => {
            if (clientRef.current?.connected) {
                clientRef.current.disconnect(() => {});
            }
        };
    }, [psychologistUsername, onEvent]);
}