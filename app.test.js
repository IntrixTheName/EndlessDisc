//const connection_test_mock = require('./app.js');
const app = require('./app');
const request = require('supertest');
const express = require('express');
//import request from 'supertest';
//import express from 'express';
//import {connection_test, connection_test_mock} from './app.js'

const app_express = new express();
app_express.use('/',app);

test('Responds to Initial Connection', async () => {
    const res = await request(app_express).get('/');
    expect(res.header['content-type']).toBe('text/html; charset=utf-8');
    expect(res.statusCode).toBe(200);
})

/*test('Connection Test', async () => {
    const req = {};
    const res = { text:'', send: function(input) {this.text = input}};
    
    await app(req, res);
    expect(res.text).toBe('app.js responded');
}); */
