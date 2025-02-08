import { io } from "socket.io-client";

export const socketClient = io("http://localhost:4000");

socketClient.on("connect", () => {
  console.log("Conectado ao servidor!");

  socketClient.emit("message", "Olá, servidor!");

  socketClient.on("message", (msg) => {
    console.log("Mensagem recebida:", msg);
  });
});
