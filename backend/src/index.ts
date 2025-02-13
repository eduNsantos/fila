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



app.get('/window', async (req, res) => {

  const windows = await redisClient.smembers('window');

  res.json({
    windows
  })

})

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

  const finalJSON = {
    password: final,
    window: null,
    generateAt: new Date(),
    date: null
  }

  await redisClient.rpush('password:queue', `${JSON.stringify(finalJSON)}`)

  console.log(`Final ${prefix}${String(password)?.padStart(3, '0')}`);

  io.emit(`queue`, {
    type: 'new',
    queue: finalJSON
  })

  res.json({
    password: final
  });
})

app.post('/queue/clear', async (req, res) => {
  await redisClient.del('password:queue');
  await redisClient.del('password:history');
  await redisClient.del('password:last:preferential');
  await redisClient.del('password:last:normal');
  await redisClient.del('window');

  res.send('ok');
})


app.post('/queue/call-next', async (req, res) => {
  const { window } = req.body;

  if (!window) {
    res.status(400).json({
      message: 'WINDOW_NOT_DEFINED'
    });
  }

  const queue = await redisClient.lpop('password:queue');

  if (!queue) {
    res.status(400).json({
      message: 'EMPTY_QUEUE'
    });

    return;
  }

  const finalQueueJSON = JSON.parse(queue);

  finalQueueJSON.window = window;

  finalQueueJSON.date = new Date();

  await redisClient.lpush('password:history', JSON.stringify(finalQueueJSON));

  io.emit('call', finalQueueJSON);

  res.json({
    queue: finalQueueJSON
  });
})


app.get('/queue/', async (req, res) => {
  const queues = await redisClient.lrange('password:queue', 0, -1);

  let jsons = [];
  for (let row of queues) {
    jsons.push(JSON.parse(row))
  }

  res.json(jsons);
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


  socket.on('joinWindows', async (windowNumber: string) => {
    if (windowNumber.trim() == '') {
      await redisClient.srem('window', socket.data);
      return;
    }


    let newSocketData = JSON.stringify({
      window: windowNumber,
      socketId: socket.id
    });

    const windows = await redisClient.smembers('window');

    let isWindowNumberTanken = false;
    for (let window of windows) {
      let windowJSON = JSON.parse(window);

      if (windowJSON.window === windowNumber) {
        isWindowNumberTanken = true;

        socket.emit('windowJoinError', 'WINDOW_ALREADY_TAKEN')
        return;
      }
    }

    await redisClient.srem('window', socket.data);

    const exists = await redisClient.sismember('window', newSocketData);

    if (!exists) {
      await redisClient.sadd('window', newSocketData);
    }

    socket.data = newSocketData;

    socket.emit('window', {
      type: 'new',
      window: windowNumber
    })

  })

  socket.on("disconnect", async () => {
    console.log(`Usuário desconectado: ${socket.id}`);

    await redisClient.srem('window', socket.data);
  });
});



redisClient;
// Inicia o servidor
const PORT = 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
