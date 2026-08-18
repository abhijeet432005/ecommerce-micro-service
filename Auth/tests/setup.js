const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

// Prevent tests from constructing an ioredis client with credentials from .env.
// Commands remain inspectable through Jest mocks when a test needs to assert them.
jest.mock('../src/db/redis', () => ({
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(0),
    quit: jest.fn().mockResolvedValue('OK')
}))

let mongoServer

beforeAll(async () => {
    process.env.SECRETE_KEY = 'test-secret-key'
    mongoServer = await MongoMemoryServer.create()
    process.env.MONGO_URI = mongoServer.getUri()
    await mongoose.connect(process.env.MONGO_URI)
})

beforeEach(async () => {
    const collections = mongoose.connection.collections

    await Promise.all(
        Object.values(collections).map((collection) => collection.deleteMany({}))
    )
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})
