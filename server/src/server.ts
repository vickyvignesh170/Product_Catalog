import { appPromise } from '@server/index';
import { config } from './config';
import { logMessage } from './utils/loggers';

appPromise.then(({ httpServer }) => {
  const server = httpServer.listen(config.port, () => {
    logMessage(`🚀 Development server running in ${config.nodeEnv} mode on port ${config.port}`);
  });

  const handleShutdown = (signal: string) => {
    logMessage(`\n🛑 ${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      logMessage('📦 HTTP server closed.');
      try {
        // Close your DB connections here
        // await db.disconnect();
        logMessage('💾 Database connection pools safely terminated.');
        process.exit(0);
      } catch (err) {
        logMessage('❌ Error during database disconnect:', err);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logMessage('⚡ Force shutting down. Core processes could not terminate in time.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}).catch((error) => {
  logMessage('Failed to initialize application server.', error);
  process.exit(1);
});
