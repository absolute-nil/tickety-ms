import express from "express";
import "express-async-errors";// to use throw in async functions 
import cookieSession from 'cookie-session'

// error middleware
import { NotFoundError, errorHandler, currentUser } from "@n19tickety/common";

import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes/index";
import { deleteOrderRouter } from "./routes/delete";


const app = express();
app.set('trust proxy', true)

app.use(express.json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== "test"
}))

// all routes get access to current user
app.use(currentUser);

//routes
app.use('/api/orders/:orderId', deleteOrderRouter);
app.use('/api/orders', indexOrderRouter)
app.use('/api/orders', newOrderRouter)
app.use('/api/orders/:orderId', showOrderRouter)

// if route does not exist
app.all("*", async () => {
  throw new NotFoundError();

})

// middleware
app.use(errorHandler);

export { app };