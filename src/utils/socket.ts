import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const socketUrl = "http://192.168.1.13:8080/websocket";

const stompClient = new Client({
    debug: (str) => console.log(str),
    webSocketFactory: () => new SockJS(socketUrl),
    onConnect: () => console.log("Connected"),
    onStompError: (frame) => console.error(frame),
});

stompClient.activate();

export default stompClient;
