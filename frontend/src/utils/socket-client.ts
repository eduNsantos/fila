import { io } from "socket.io-client";

export const socketClient = io("http://localhost:4000", {
  transports: ['websocket']
});

socketClient.on("connect", () => {
  console.log("Conectado ao servidor!");
});
