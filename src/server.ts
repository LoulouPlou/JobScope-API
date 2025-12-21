import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import express from 'express';
import config from 'config';
import app from './app';
import { connectDB } from './utils/database';
import { seedDatabase } from './data/seed';
import { logger } from './utils/logger';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

async function startServer() {
  try {
    await connectDB();
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      await seedDatabase();
      console.log(`Database in env ${process.env.NODE_ENV} seeded`);
    }

    // HTTP and HTTPS Configuration
    const httpEnabled = config.get<boolean>('server.http.enabled');
    const httpPort = config.get<number>('server.http.port');

    const httpsEnabled = config.get<boolean>('server.https.enabled');
    const httpsPort = config.get<number>('server.https.port');
    const redirectAllHttpToHttps = config.get<boolean>('server.https.redirectAllHttpToHttps');

    // HTTP Server
    if (httpEnabled) {
      if (httpsEnabled && redirectAllHttpToHttps) {
        const redirectApp = express();
        redirectApp.use((req, res) => {
          const host = req.headers.host?.split(':')[0];
          const redirectUrl = `https://${host}${
            httpsPort === 443 ? '' : ':' + httpsPort
          }${req.url}`;
          res.redirect(301, redirectUrl);
        });

        redirectApp.listen(httpPort, () => {
          logger.info(`HTTP redirect running on port ${httpPort} to HTTPS ${httpsPort}`);
        });
      } else {
        app.listen(httpPort, () => {
          logger.info(`HTTP server running on port ${httpPort}`);
        });
      }
    }

    // HTTPS Server
    if (httpsEnabled) {
      const sslKeyPath = process.env.SSL_KEY_PATH || config.get<string>('server.https.keyPath');
      const sslCertPath = process.env.SSL_CERT_PATH || config.get<string>('server.https.certPath');

      if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
        logger.warn('SSL key or certificate file not found. HTTPS server not started.');
      } else {
        const httpsOptions = {
          key: fs.readFileSync(sslKeyPath),
          cert: fs.readFileSync(sslCertPath),
        };
        https.createServer(httpsOptions, app).listen(httpsPort, () => {
          logger.info(`HTTPS server running on https://localhost:${httpsPort}`);
        });
      }
    }

    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
