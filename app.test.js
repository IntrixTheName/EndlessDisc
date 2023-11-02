import request from 'supertest';
import express from 'express';

const app = require('app.js');

test('Connection Test', async () => {
    const res = await request(app).get('/connection-test');
    expect(res.message).toBe('app.js responded');
});