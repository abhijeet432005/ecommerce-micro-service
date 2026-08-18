const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

// Prevent ImageKit (and its ESM-only uuid dependency) from loading in tests.
jest.mock('../src/service/imageKit.service', () => ({
    uploadImage: jest.fn()
}))

process.env.NODE_ENV = 'test'

const app = require('../src/app')
const Product = require('../src/model/product.model')

describe('GET /products', () => {
    let mongo

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create()
        await mongoose.connect(mongo.getUri())
        await Product.syncIndexes()
    })

    beforeEach(async () => {
        await Product.deleteMany({})
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongo.stop()
    })

    const createProduct = (overrides = {}) => Product.create({
        title: overrides.title ?? 'Sample Product',
        description: overrides.description ?? 'A great product',
        price: overrides.price ?? { amount: 100, currency: 'USD' },
        seller: overrides.seller ?? new mongoose.Types.ObjectId(),
        images: overrides.images ?? []
    })

    it('returns an empty list when no products exist', async () => {
        const response = await request(app).get('/products')

        expect(response.status).toBe(200)
        expect(response.body.data).toEqual([])
    })

    it('returns all products', async () => {
        await Promise.all([
            createProduct({ title: 'P1' }),
            createProduct({ title: 'P2' }),
            createProduct({ title: 'P3' })
        ])

        const response = await request(app).get('/products')

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(3)
    })

    it('searches product titles and descriptions with q', async () => {
        await Promise.all([
            createProduct({ title: 'Red Shirt', description: 'Cotton' }),
            createProduct({ title: 'Blue Shirt', description: 'Wool' }),
            createProduct({ title: 'Green Pants', description: 'Linen' })
        ])

        const response = await request(app).get('/products').query({ q: 'shirt' })

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)
        expect(response.body.data.map((product) => product.title).sort())
            .toEqual(['Blue Shirt', 'Red Shirt'])
    })

    it('filters products by minprice and maxprice', async () => {
        await Promise.all([
            createProduct({ title: 'Low', price: { amount: 50, currency: 'USD' } }),
            createProduct({ title: 'Mid', price: { amount: 100, currency: 'USD' } }),
            createProduct({ title: 'High', price: { amount: 150, currency: 'USD' } })
        ])

        const response = await request(app)
            .get('/products')
            .query({ minprice: '60', maxprice: '120' })

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0].title).toBe('Mid')
    })

    it('supports pagination with skip and limit', async () => {
        await Promise.all(
            ['P1', 'P2', 'P3', 'P4', 'P5'].map((title) => createProduct({ title }))
        )

        const response = await request(app)
            .get('/products')
            .query({ skip: '4', limit: '2' })

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
    })
})
