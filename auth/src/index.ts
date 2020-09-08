import express from "express";
import "express-async-errors";// to use throw in async functions 
import mongoose from "mongoose";

//route handlers
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/sign-in";
import { signUpRouter } from "./routes/sign-up";
import { signOutRouter } from "./routes/sign-out";

// error
import { NotFoundError } from "./errors/not-found-error";

//middleware
import { errorHandler } from "./middlewares/error-handler";


const app = express();

app.use(express.json());

//routes
app.use("/api/users/currentuser", currentUserRouter);
app.use("/api/users/signup", signUpRouter);
app.use("/api/users/signin", signInRouter);
app.use("/api/users/signout", signOutRouter);

// if route does not exist
app.all("*", async () => {
  throw new NotFoundError();

})

// middleware
app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
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

