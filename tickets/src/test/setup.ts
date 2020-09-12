import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";

import { app } from "../app";

// add signin property to global
declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
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


global.signin = () => {

  // Build a jwt payload. {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
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