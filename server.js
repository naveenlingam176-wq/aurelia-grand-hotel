/**
 * Backend Server for Aurelia Grand Luxury Hotel Management System
 * Built-in Node.js HTTP Server with API Routing, Security Headers, CORS, and Static File Serving
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { getDatabase } = require('./db/database');
const UserRepository = require('./repositories/userRepository');
const AuthController = require('./controllers/authController');
const { authenticateToken } = require('./middleware/authMiddleware');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Initialize DB and Seed Default Users
try {
  getDatabase();
  const userRepo = new UserRepository();
  userRepo.seedDefaultUsers();
  console.log('[Database] SQLite initialized and default accounts verified.');
} catch (err) {
  console.error('[Database Error]', err);
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

function serveStaticFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Server Error: ${err.message}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Enhance res with status and json helpers
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
  };

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // --- API ROUTES ---
  if (pathname.startsWith('/api/')) {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
      // Safeguard max body size (1MB)
      if (bodyData.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', () => {
      if (bodyData) {
        try {
          req.body = JSON.parse(bodyData);
        } catch (e) {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      // Route: POST /api/auth/login
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        return AuthController.handleLogin(req, res);
      }

      // Route: GET /api/auth/me (Protected)
      if (pathname === '/api/auth/me' && req.method === 'GET') {
        return authenticateToken(req, res, () => {
          return AuthController.handleGetCurrentUser(req, res);
        });
      }

      // Route: POST /api/auth/logout
      if (pathname === '/api/auth/logout' && req.method === 'POST') {
        return AuthController.handleLogout(req, res);
      }

      // Route: GET /api/health
      if (pathname === '/api/health' && req.method === 'GET') {
        return res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
      }

      // 404 for unknown API routes
      return res.status(404).json({ success: false, message: 'API endpoint not found' });
    });
    return;
  }

  // --- STATIC ASSETS SERVING ---
  let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveStaticFile(req, res, filePath);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Aurelia Grand Server] Running at http://localhost:${PORT}`);
    console.log(`[Aurelia Grand Server] API Endpoints ready at http://localhost:${PORT}/api/auth/login`);
  });
}

module.exports = server;
