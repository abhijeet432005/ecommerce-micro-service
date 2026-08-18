const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.SECRETE_KEY = 'testsecret';

jest.mock('../src/service/imageKit.service', () => ({
    uploadImage: jest.fn(async (file) => ({
        url: `https://ik.mock/${file.originalname}`,
        thumbnail: `https://ik.mock/thumb/${file.originalname}`,
        id: `file_${file.originalname}`,
    })),
}));

const app = require('../src/app');

describe('POST /products', () => {
    let mongo;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();
        process.env.MONGO_URI = uri;
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        if (mongo) await mongo.stop();
    });

    afterEach(async () => {
        const collections = await mongoose.connection.db.collections();
        for (const c of collections) await c.deleteMany({});
    });

    it('creates a product and uploads images', async () => {
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'seller' }, process.env.SECRETE_KEY);
        const res = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Test Product')
            .field('description', 'Nice one')
            .field('priceAmount', '99.99')
            .field('priceCurrency', 'USD')
            .attach('image', Buffer.from('test image'), 'sample.jpg');

        expect(res.status).toBe(201);
        expect(res.body?.data?.title).toBe('Test Product');
        expect(res.body?.data?.price?.amount).toBe(99.99);
        expect(res.body?.data?.images?.length).toBe(1);
        expect(res.body?.data?.images[ 0 ]?.url).toContain('https://ik.mock/');
    });

    it('validates required fields', async () => {
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'seller' }, process.env.SECRETE_KEY);
        const res = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'X');
        expect(res.status).toBe(400);
    });
});
