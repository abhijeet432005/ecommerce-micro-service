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

describe('GET /products/:id', () => {
    let mongo

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create()
        await mongoose.connect(mongo.getUri())
    })

    beforeEach(async () => {
        await Product.deleteMany({})
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongo.stop()
    })

    const createProduct = (overrides = {}) => Product.create({
        title: overrides.title ?? 'ById Product',
        description: overrides.description ?? 'Desc',
        price: overrides.price ?? { amount: 42, currency: 'USD' },
        seller: overrides.seller ?? new mongoose.Types.ObjectId(),
        images: overrides.images ?? []
    })

    it('returns 400 for an invalid product ID', async () => {
        const response = await request(app).get('/products/not-a-valid-id')

        expect(response.status).toBe(400)
        expect(response.body.Message).toMatch(/invalid product id/i)
    })

    it('returns 404 when the product does not exist', async () => {
        const id = new mongoose.Types.ObjectId().toHexString()
        const response = await request(app).get(`/products/${id}`)

        expect(response.status).toBe(404)
        expect(response.body.Message).toMatch(/not found/i)
    })

    it('returns the product when it exists', async () => {
        const product = await createProduct({ title: 'Found Product' })
        const response = await request(app).get(`/products/${product._id}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toMatchObject({
            _id: product._id.toString(),
            title: 'Found Product'
        })
    })
})
