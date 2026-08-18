const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { MongoMemoryServer } = require('mongodb-memory-server')

jest.mock('../src/service/imageKit.service', () => ({
    uploadImage: jest.fn(async () => ({
        url: 'https://ik.mock/x',
        thumbnail: 'https://ik.mock/t',
        id: 'file_x'
    }))
}))

process.env.NODE_ENV = 'test'
process.env.SECRETE_KEY = process.env.SECRETE_KEY || 'testsecret'

const app = require('../src/app')
const Product = require('../src/model/product.model')

describe('GET /products/seller (seller)', () => {
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
        await Product.syncIndexes()

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
        title: overrides.title ?? 'My Product',
        description: overrides.description ?? 'Mine',
        price: overrides.price ?? { amount: 10, currency: 'USD' },
        seller: overrides.seller ?? sellerId1,
        images: overrides.images ?? []
    })

    it('requires authentication (401) when no token is provided', async () => {
        const response = await request(app).get('/products/seller')

        expect(response.status).toBe(401)
    })

    it('requires seller role (403) when role is not seller', async () => {
        const token = signToken(sellerId1.toHexString(), 'user')

        const response = await request(app)
            .get('/products/seller')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(403)
    })

    it('lists only products owned by the authenticated seller', async () => {
        await Promise.all([
            createProduct({ title: 'A1', seller: sellerId1 }),
            createProduct({ title: 'A2', seller: sellerId1 }),
            createProduct({ title: 'B1', seller: sellerId2 })
        ])

        const token = signToken(sellerId1.toHexString(), 'seller')

        const response = await request(app)
            .get('/products/seller')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)

        const titles = response.body.data.map((product) => product.title).sort()
        expect(titles).toEqual(['A1', 'A2'])
    })

    it('supports pagination with skip and limit', async () => {
        await Promise.all([
            createProduct({ title: 'P1', seller: sellerId1 }),
            createProduct({ title: 'P2', seller: sellerId1 }),
            createProduct({ title: 'P3', seller: sellerId1 }),
            createProduct({ title: 'P4', seller: sellerId1 })
        ])

        const token = signToken(sellerId1.toHexString(), 'seller')

        let response = await request(app)
            .get('/products/seller')
            .set('Authorization', `Bearer ${token}`)
            .query({ limit: '2' })

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)

        response = await request(app)
            .get('/products/seller')
            .set('Authorization', `Bearer ${token}`)
            .query({ skip: '2', limit: '2' })

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)
    })
})
