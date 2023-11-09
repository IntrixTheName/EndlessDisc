const app = require('./app.js');
const request = require('supertest');
//import request from 'supertest';
//import express from 'express';

test('Connection Test', () => {
    
    const res = request(app).get('/connection-test')
    expect(res.message).toBe('app.js responded');
});