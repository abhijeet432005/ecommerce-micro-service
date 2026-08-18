process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db-skip-real';
process.env.SECRETE_KEY = process.env.SECRETE_KEY || 't7/V1?gQg0sHMJyIKS*DnW!p?Nb0e?zgj5{TKkkmXPx';
process.env.JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';