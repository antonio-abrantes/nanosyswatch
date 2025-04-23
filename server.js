const express = require("express");
const si = require("systeminformation");
const authenticate = require("./middlewares/auth");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.json({
    status: 200,
    name: "NanoSysWatch API",
    description: "API para monitoramento de CPU, memória e discos.",
    version: "1.0.0",
    author: "Antônio Abrantes",
    repository: "https://github.com/antonio-abrantes/nanosyswatch",
    endpoints: {
      "/": "Informações sobre a API",
      "/status": "Retorna dados de uso do sistema (CPU, memória, discos)",
    },
  });
});

app.get("/status", authenticate, async (req, res) => {
  try {
    const [cpu, currentLoad, mem, disks] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
    ]);

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
        used: (mem.used / 1024 / 1024 / 1024).toFixed(2) + " GB",
        free: (mem.free / 1024 / 1024 / 1024).toFixed(2) + " GB",
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
    console.error(err);
    res.status(500).json({ error: "Erro ao obter informações do sistema" });
  }
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
