import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import busHandler from './api/bus.js';
import healthHandler from './api/health.js';
import locationHandler from './api/location.js';
import incidentsHandler from './api/incidents.js';
import busStopsHandler from './api/bus-stops.js';
import busRoutesHandler from './api/bus-routes.js';
import postalHandler from './api/postal.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST - importing shared handlers from api/
  app.get('/api/bus', busHandler);
  app.get('/api/health', healthHandler);
  app.get('/api/location', locationHandler);
  app.get('/api/incidents', incidentsHandler);
  app.get('/api/bus-stops', busStopsHandler);
  app.get('/api/bus-routes', busRoutesHandler);
  app.get('/api/postal', postalHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
