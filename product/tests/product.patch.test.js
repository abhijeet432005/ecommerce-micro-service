const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { MongoMemoryServer } = require('mongodb-memory-server')

// Prevent ImageKit (and its ESM-only uuid dependency) from loading in tests.
jest.mock('../src/service/imageKit.service', () => ({
    uploadImage: jest.fn()
}))

process.env.NODE_ENV = 'test'
process.env.SECRETE_KEY = 'testsecret'

const app = require('../src/app')
const Product = require('../src/model/product.model')

describe('PATCH /products/:id (seller)', () => {
    let mongo
    let sellerId1
    let sellerId2

    const signToken = (id, role = 'seller') => jwt.sign(
        { id, role },
        process.env.SECRETE_KEY
    )

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create()
        await mongoose.connect(mongo.getUri())
        sellerId1 = new mongoose.Types.ObjectId()
        sellerId2 = new mongoose.Types.ObjectId()
    })

    beforeEach(async () => {
        await Product.deleteMany({})
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongo.stop()
    })

    const createProduct = (overrides = {}) => Product.create({
        title: overrides.title ?? 'Patch Target',
        description: overrides.description ?? 'To be updated',
        price: overrides.price ?? { amount: 10, currency: 'USD' },
        seller: overrides.seller ?? sellerId1,
        images: overrides.images ?? []
    })

    it('returns 401 when no token is provided', async () => {
        const product = await createProduct()

        await request(app)
            .patch(`/products/${product._id}`)
            .send({ title: 'Nope' })
            .expect(401)
    })

    it('returns 403 when the role is not seller', async () => {
        const product = await createProduct()
        const token = signToken(sellerId1.toHexString(), 'user')

        await request(app)
            .patch(`/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Nope' })
            .expect(403)
    })

    it('returns 400 for an invalid product ID', async () => {
        const token = signToken(sellerId1.toHexString())

        await request(app)
            .patch('/products/not-a-valid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'X' })
            .expect(400)
    })

    it('returns 404 when the product does not exist', async () => {
        const token = signToken(sellerId1.toHexString())
        const missingId = new mongoose.Types.ObjectId().toHexString()

        await request(app)
            .patch(`/products/${missingId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'New' })
            .expect(404)
    })

    it("returns 403 when updating another seller's product", async () => {
        const product = await createProduct({ seller: sellerId2 })
        const token = signToken(sellerId1.toHexString())

        await request(app)
            .patch(`/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Hack' })
            .expect(403)
    })

    it('updates allowed fields and returns the updated product', async () => {
        const product = await createProduct({
            title: 'Old',
            description: 'OldDesc',
            price: { amount: 10, currency: 'USD' }
        })
        const token = signToken(sellerId1.toHexString())

        const response = await request(app)
            .patch(`/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'New',
                description: 'NewDesc',
                price: { amount: 25, currency: 'USD' }
            })

        expect(response.status).toBe(200)
        expect(response.body.data).toMatchObject({
            title: 'New',
            description: 'NewDesc',
            price: { amount: 25, currency: 'USD' }
        })
    })
})
