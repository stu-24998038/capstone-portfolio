const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');

(async () => {
  try {
    await connectDB();
    const result = await seedDatabase({ admin: env.admin });
    console.log('[seed] Portfolio content is ready.');
    console.log(`[seed] Admin: ${result.admin.email} / ${env.admin.password}`);
    console.log(`[seed] Demo reader: ${result.reader.email} / Reader123!`);
    console.log('[seed] Counts:', result.counts);
  } catch (error) {
    console.error('[seed] Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();
