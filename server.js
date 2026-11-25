const express = require('express');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/api/status', (req, res) => {
  const mem = process.memoryUsage();
  const memoryBytes = req.query.type === 'rss' ? mem.rss : mem.heapUsed;
  const memoryUsageMB = Number((memoryBytes / (1024 * 1024)).toFixed(2));

  const uptimeSeconds = req.query.raw === 'true'
    ? Number(process.uptime().toFixed(2))
    : Math.round(process.uptime());

  const cpuCount = os.cpus().length;
  const timestamp = new Date().toISOString();

  res.json({
    uptimeSeconds,
    memoryUsageMB,
    cpuCount,
    timestamp
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
}

module.exports = app;
