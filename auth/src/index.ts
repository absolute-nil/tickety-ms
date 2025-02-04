import mongoose from "mongoose";

import { app } from './app'
const start = async () => {
  console.log('starting up ......');
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");

  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");

  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    console.log("connected to mongodb")
  } catch (e) {
    console.error(e);
  }
  app.listen(3000, () => {
    console.log("auth service running on port 3000");
  })
}

start();

