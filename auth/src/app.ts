import express from "express";
import "express-async-errors";// to use throw in async functions 
import cookieSession from 'cookie-session'

//route handlers
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/sign-in";
import { signUpRouter } from "./routes/sign-up";
import { signOutRouter } from "./routes/sign-out";

// error
import { NotFoundError } from "@n19tickety/common";

//middleware
import { errorHandler } from "@n19tickety/common";


const app = express();
app.set('trust proxy', true)

app.use(express.json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== "test"
}))

//routes
app.use("/api/users/currentuser", currentUserRouter);
app.use("/api/users/signin", signInRouter);
app.use("/api/users/signout", signOutRouter);
app.use("/api/users/signup", signUpRouter);

// if route does not exist
app.all("*", async () => {
  throw new NotFoundError();

})

// middleware
app.use(errorHandler);

export { app };