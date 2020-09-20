import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";

import { app } from "../app";

// add signin property to global
declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

// mock the nats wrapper (whereever nats-wrapper.ts will be imported it will redirect to the fake file in mocks)
jest.mock('../nats-wrapper.ts')

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
  // clear the mock data (this will clear the data in mocks so that if one test invoked the nats wrapper)
  // and the other one does not we can capture that (it will basically change the flag of invoked to false before each test)
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }

})

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
})


global.signin = (id?: string) => {

  // Build a jwt payload. {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];

}