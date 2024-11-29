import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

if (!socketUrl) {
    throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined.");
}

const stompClient = new Client({
    debug: (str) => console.log(str),
    webSocketFactory: () => new SockJS(socketUrl),
    onConnect: () => console.log("Connected"),
    onStompError: (frame) => console.error(frame),
});

stompClient.activate();

export default stompClient;
