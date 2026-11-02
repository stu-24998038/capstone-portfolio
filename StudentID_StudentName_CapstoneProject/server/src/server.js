const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

let server;

async function start() {
  await connectDB();

  server = app.listen(env.port, () => {
    console.log(`[api] Folio API listening on http://localhost:${env.port}`);
    console.log(`[api] Environment: ${env.nodeEnv}`);
    console.log(`[api] CORS origins: ${env.clientUrls.join(', ')}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received. Shutting down gracefully...`);
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('[api] Failed to start:', error.message);
  process.exit(1);
});
