import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permite conexões de qualquer origem
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor Express com Socket.IO rodando!");
});

const delay = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(true), ms);
    })
}
// Evento de conexão do Socket.IO
io.on("connection", async (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.on("message", (msg) => {
    console.log(`Mensagem recebida: ${msg}`);
    io.emit("message", msg); // Envia a mensagem para todos os clientes
  });

  const calls = [
    { password: 'A01', window: '2' },
    { password: 'P01', window: '3' },
    { password: 'A02', window: '2' }
  ];

  setTimeout(async () => {
    for (let i = 0; i < calls.length; i++) {
        let currentCall = calls[i];

        socket.emit('call', currentCall);

        await delay(3000);
    }
  }, 1000)

  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
  });
});

// Inicia o servidor
const PORT = 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
