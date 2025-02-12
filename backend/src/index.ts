import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { redisClient } from "./utils/redisClient";
import { userInfo } from "os";

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


app.post('/queue/generate-password', async (req, res) => {
  const { type } = req.body;

  if (!type) {
    res.status(400).json({
      message: 'type not defined'
    })
    return;
  }

  if (!['preferential', 'normal'].includes(type)) {

    res.status(400).json({
      message: 'type is not valid'
    })
    return;
  }

  const prefix = type == 'preferential' ? 'P' : 'N';
  let password;
  let final;

  let lastFoundPassword = await redisClient.get(`password:last:${type}`);

  if (!lastFoundPassword) {
    await redisClient.set(`password:last:${type}`, '1');

    password = 1;
  } else {
    password = parseInt(lastFoundPassword);
    password++;
  }

  final = `${prefix}${String(password)?.padStart(3, '0')}`;

  await redisClient.set(`password:last:${type}`, `${password}`);

  await redisClient.rpush('password:queue', `${final}`)

  console.log(`Final ${prefix}${String(password)?.padStart(3, '0')}`);

  res.json({
    password: final
  });
})

app.get('/queue/clear', async (req, res) => {
  await redisClient.del('password:queue');
  await redisClient.del('password:last:preferential');
  await redisClient.del('password:last:normal');

  res.send('ok');
})


app.get('/queue/call-next', async (req, res) => {
  const queue = await redisClient.lpop('password:queue');

  if (!queue) {
    res.status(400).json({
      message: 'EMPTY_QUEUE'
    });

    return;
  }

  const finalQueueJSON = { password: queue, window: '2', date: new Date() };

  await redisClient.lpush('password:history', JSON.stringify(finalQueueJSON));

  io.emit('call', finalQueueJSON);

  res.json({
    queue: queue
  });
})


app.get('/queue/', async (req, res) => {
  const queues = await redisClient.lrange('password:queue', 0, -1);

  res.json(queues);
});


app.get('/queue/history', async (req, res) => {
  const history = await redisClient.lrange('password:history', 0, -1);

  let jsons = [];
  for (let row of history) {
    jsons.push(JSON.parse(row))
  }

  res.json(jsons);
});

const delay = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(true), ms);
    })
}

io.on("connection", async (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.on("message", (msg) => {
    console.log(`Mensagem recebida: ${msg}`);
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
  });
});



redisClient;
// Inicia o servidor
const PORT = 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
