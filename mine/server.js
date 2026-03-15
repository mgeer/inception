const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const BASE = __dirname;
const HTML_FILE = path.join(BASE, 'index.html');
const STATUS_FILE = path.join(BASE, 'status.json');
const DISC_DIR = path.join(BASE, 'discoveries');
const INDEX_FILE = path.join(DISC_DIR, 'index.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (url.pathname === '/') {
    serve(res, HTML_FILE);
  } else if (url.pathname === '/api/status') {
    serve(res, STATUS_FILE);
  } else if (url.pathname === '/api/discoveries') {
    serveFullDiscoveries(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

function serveFullDiscoveries(res) {
  try {
    const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    const full = index.map(entry => {
      try {
        return JSON.parse(fs.readFileSync(path.join(DISC_DIR, `${entry.id}.json`), 'utf8'));
      } catch {
        return entry;
      }
    });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(full));
  } catch {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end('[]');
  }
}

function serve(res, filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath) || '.json';
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end('{}');
  }
}

server.listen(PORT, () => {
  console.log(`\n  ◉ 需求雷达已启动\n  http://localhost:${PORT}\n`);
});
