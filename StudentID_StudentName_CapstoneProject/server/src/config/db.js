const mongoose = require('mongoose');
const env = require('./env');

async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    // Let Atlas manage indexes in production; build them automatically in dev.
    autoIndex: !env.isProduction,
  });

  const { host, name } = connection.connection;
  console.log(`[db] Connected to MongoDB (${name} @ ${host})`);
  return connection;
}

async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
