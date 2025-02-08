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

// Evento de conexão do Socket.IO
io.on("connection", (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.on("message", (msg) => {
    console.log(`Mensagem recebida: ${msg}`);
    io.emit("message", msg); // Envia a mensagem para todos os clientes
  });

  setTimeout(() => {

    socket.emit('call', {
        password: '911',
        window: '7'
      })
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
