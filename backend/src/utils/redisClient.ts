import Redis from "ioredis";

export const redisClient = new Redis({
  host: "Redis", // Se estiver rodando dentro de um container sem `network_mode: host`, use o nome do serviço do Redis
  port: 6379,        // Porta padrão do Redis
  // password: "sua_senha", // Descomente se precisar de autenticação
});

redisClient.on("connect", async () => {
  console.log("✅ Conectado ao Redis")
  await redisClient.del('window');
});
redisClient.on("error", (err) => console.error("❌ Erro no Redis:", err));

