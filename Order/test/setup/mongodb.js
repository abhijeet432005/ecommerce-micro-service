const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongo;
let mongoConnected = false;

beforeAll(async () => {
    try {
        // Start in-memory MongoDB
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();

        // Override MONGO_URI for app/db code
        process.env.MONGO_URI = uri;

        // Connect mongoose directly for model tests if needed
        await mongoose.connect(uri, {
            dbName: 'jest',
        });
        mongoConnected = true;
    } catch (error) {
        console.error('Failed to start MongoDB Memory Server:', error);
        throw error;
    }
}, 30000); // Increase timeout for MongoDB startup

beforeEach(async () => {
    if (!mongoConnected || !mongoose.connection.db) {
        return;
    }

    try {
        // Clear all collections between tests
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    } catch (error) {
        console.warn('Error clearing collections:', error.message);
    }
});

afterAll(async () => {
    try {
        // Close mongoose connection if it exists
        if (mongoConnected && mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            mongoConnected = false;
        }

        // Stop the MongoDB server
        if (mongo) {
            await mongo.stop({ doCleanup: true });
        }
    } catch (error) {
        console.error('Error during cleanup:', error.message);
    }
}, 30000); // Increase timeout for cleanup