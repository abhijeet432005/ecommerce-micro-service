const request = require('supertest');
const app = require('../src/app');

describe('POST /auth/register', () => {

    it('creates a user and returns 201 with user (no password)', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                userName: 'john_doe',
                email: 'john@example.com',
                password: 'Secret123!',
                fullName: { firstName: 'John', lastName: 'Doe' },
            });

        expect(res.status).toBe(201);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.userName).toBe('john_doe');
        expect(res.body.user.email).toBe('john@example.com');
        expect(res.body.user.password).toBeUndefined();
    });

    it('rejects a duplicate email with 409', async () => {
        const payload = {
            userName: 'dupuser',
            email: 'dup@example.com',
            password: 'Secret123!',
            fullName: { firstName: 'Dup', lastName: 'User' },
        };

        await request(app).post('/auth/register').send(payload).expect(201);
        const res = await request(app).post('/auth/register').send(payload);

        expect(res.status).toBe(409);
    });

    it('validates missing fields with 400', async () => {
        const res = await request(app).post('/auth/register').send({});
        expect(res.status).toBe(400);
    });
});
