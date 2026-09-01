/**
 * Server Entry Point
 * Starts the Express server
 */

import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   LegalSense Backend API                                 ║
║                                                          ║
║   Environment: ${config.nodeEnv.padEnd(20)}║
║   Port: ${config.port.toString().padEnd(28)}║
║                                                          ║
║   API: http://localhost:${config.port}                    ║
║   Health: http://localhost:${config.port}/health          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
