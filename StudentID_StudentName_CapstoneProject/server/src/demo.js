/**
 * Zero-setup demo server.
 *
 * Starts an ephemeral in-memory MongoDB, seeds the portfolio, and boots the
 * API. This is only for local previews and automated verification — the
 * graded/production deployment uses MongoDB Atlas via MONGODB_URI.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'local-demo-only-secret-change-me-1234567890';
process.env.MONGOMS_DOWNLOAD_DIR =
  process.env.MONGOMS_DOWNLOAD_DIR ||
  require('node:path').resolve(__dirname, '..', '.mongodb-binaries');

const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  let mongod;
  try {
    mongod = await MongoMemoryServer.create({
      instance: { dbName: 'folio-demo' },
    });
    process.env.MONGODB_URI = mongod.getUri('folio-demo');

    // Load configuration only after the in-memory connection string exists.
    const env = require('./config/env');
    const { connectDB, disconnectDB } = require('./config/db');
    const { seedDatabase } = require('./seed/seedData');

    await connectDB();
    const result = await seedDatabase({ admin: env.admin, reset: true });
    console.log('[demo] Seeded ephemeral database:', result.counts);

    const app = require('./app');
    const server = app.listen(env.port, () => {
      console.log(`[demo] API ready at http://localhost:${env.port}`);
      console.log(`[demo] Admin login: ${env.admin.email} / ${env.admin.password}`);
      console.log('[demo] Data disappears when this process stops.');
    });

    const shutdown = async () => {
      await new Promise((resolve) => server.close(resolve));
      await disconnectDB();
      await mongod.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[demo] Failed to start:', error);
    if (mongod) await mongod.stop();
    process.exit(1);
  }
})();
