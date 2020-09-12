import express from "express";
import "express-async-errors";// to use throw in async functions 
import cookieSession from 'cookie-session'

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


// if route does not exist
app.all("*", async () => {
  throw new NotFoundError();

})

// middleware
app.use(errorHandler);

export { app };