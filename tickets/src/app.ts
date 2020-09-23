import express from "express";
import "express-async-errors";// to use throw in async functions 
import cookieSession from 'cookie-session'

// error middleware
import { NotFoundError, errorHandler, currentUser } from "@n19tickety/common";

import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";


const app = express();
app.set('trust proxy', true)

app.use(express.json());
app.use(cookieSession({
  signed: false,
  secure: false //* for dev - process.env.NODE_ENV !== "test"
}))

// all routes get access to current user
app.use(currentUser);

//routes
app.use('/api/tickets', createTicketRouter);
app.use('/api/tickets', showTicketRouter)
app.use('/api/tickets', indexTicketRouter)
app.use('/api/tickets', updateTicketRouter)

// if route does not exist
app.all("*", async () => {
  throw new NotFoundError();

})

// middleware
app.use(errorHandler);

export { app };