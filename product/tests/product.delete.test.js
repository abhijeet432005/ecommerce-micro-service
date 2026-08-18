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
process.env.SECRETE_KEY = 'testsecret'

const app = require('../src/app')
const Product = require('../src/model/product.model')

describe('DELETE /products/:id (seller)', () => {
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
        title: overrides.title ?? 'To Delete',
        description: overrides.description ?? 'Delete me',
        price: overrides.price ?? { amount: 10, currency: 'USD' },
        seller: overrides.seller ?? sellerId1,
        images: overrides.images ?? []
    })

    it('returns 401 when no token is provided', async () => {
        const product = await createProduct()

        await request(app)
            .delete(`/products/${product._id}`)
            .expect(401)
    })

    it('returns 403 when the role is not seller', async () => {
        const product = await createProduct()
        const token = signToken(sellerId1.toHexString(), 'user')

        await request(app)
            .delete(`/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
    })

    it('returns 400 for an invalid product ID', async () => {
        const token = signToken(sellerId1.toHexString())

        await request(app)
            .delete('/products/not-a-valid-id')
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
    })

    it('returns 404 when the product does not exist', async () => {
        const token = signToken(sellerId1.toHexString())
        const missingId = new mongoose.Types.ObjectId().toHexString()

        await request(app)
            .delete(`/products/${missingId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    })

    it("returns 403 when deleting another seller's product", async () => {
        const product = await createProduct({ seller: sellerId2 })
        const token = signToken(sellerId1.toHexString())

        await request(app)
            .delete(`/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
    })

    it('deletes the product and returns a success response', async () => {
        const product = await createProduct()
        const token = signToken(sellerId1.toHexString())

        const response = await request(app)
            .delete(`/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(response.body.message || response.body.data).toBeDefined()

        const found = await Product.findById(product._id)
        expect(found).toBeNull()
    })
})
