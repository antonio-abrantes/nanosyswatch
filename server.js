const express = require("express");
const si = require("systeminformation");
const cors = require("cors");
const authenticate = require("./middlewares/auth");

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "no-referrer",
  });
  next();
});

app.use(cors());

const rateMap = new Map();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateMap) {
    if (now - data.start > RATE_WINDOW) rateMap.delete(key);
  }
}, RATE_WINDOW).unref();

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { count: 1, start: now });
    return next();
  }
  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({ error: "Too many requests" });
  }
  entry.count++;
  next();
});

function withTimeout(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms),
    ),
  ]);
}

app.get("/", (req, res) => {
  res.json({
    status: 200,
    name: "NanoSysWatch API",
    description: "API para monitoramento de CPU, memória e discos.",
    version: "1.1.0",
    author: "Antônio Abrantes",
    repository: "https://github.com/antonio-abrantes/nanosyswatch",
    endpoints: {
      "/": "Informações sobre a API",
      "/status": "Retorna dados de uso do sistema (CPU, memória, discos)",
    },
  });
});

app.get("/ping", authenticate, (req, res) => {
  res.status(200).json({ message: "pong", status: "online" });
});

app.get("/ping/latency", authenticate, (req, res) => {
  const start = Date.now();
  res.status(200).json({
    message: "pong",
    status: "online",
    responseTimeMs: Date.now() - start,
  });
});

app.get("/status", authenticate, async (req, res) => {
  try {
    const [cpu, currentLoad, mem, disks] = await withTimeout(
      Promise.all([si.cpu(), si.currentLoad(), si.mem(), si.fsSize()]),
    );

    const data = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpu.speed,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        load: currentLoad.currentLoad.toFixed(2),
        coresLoad: currentLoad.cpus.map((core, index) => ({
          core: index,
          load: core.load.toFixed(2),
        })),
      },
      memory: {
        total: (mem.total / 1024 / 1024 / 1024).toFixed(2) + " GB",
        used: (mem.active / 1024 / 1024 / 1024).toFixed(2) + " GB",
        free:
          ((mem.total - mem.active) / 1024 / 1024 / 1024).toFixed(2) + " GB",
        cached: (mem.buffcache / 1024 / 1024 / 1024).toFixed(2) + " GB",
        available: (mem.available / 1024 / 1024 / 1024).toFixed(2) + " GB",
      },
      disks: disks.map((disk) => ({
        device: disk.fs,
        type: disk.type,
        mount: disk.mount,
        used: (disk.used / 1024 / 1024 / 1024).toFixed(2) + " GB",
        size: (disk.size / 1024 / 1024 / 1024).toFixed(2) + " GB",
        available: (disk.available / 1024 / 1024 / 1024).toFixed(2) + " GB",
        use: disk.use.toFixed(2) + "%",
      })),
    };

    res.json(data);
  } catch (err) {
    const status = err.message === "Timeout" ? 503 : 500;
    res.status(status).json({ error: "Erro ao obter informações do sistema" });
  }
});

const server = app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;
server.setTimeout(30_000);

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", (err) => {
  console.error("uncaughtException", err);
  shutdown();
});
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection", reason);
});
