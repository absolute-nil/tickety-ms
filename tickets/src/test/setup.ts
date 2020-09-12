import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../app";

// add signin property to global
declare global {
  namespace NodeJS {
    interface Global {
      signin(): Promise<string[]>;
    }
  }
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'abojsxdc';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true
  })
})


beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }

})

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
})


global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie;
}