import mongoose from "mongoose";
import express, { Request, Response } from "express";
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError, } from "@n19tickety/common";
import { body } from "express-validator";

import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

const router = express.Router();

// you can extract this to env variable or save it to database in production app 
// so that it can be easily accessed and it is not hidden away in a file
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post("/", requireAuth, [
  body('ticketId')
    .not()
    .isEmpty()
    // ! the below implemented custom logic to ensure that ticketId is mongoose id 
    // ! it should not be implemented in production apps because in real life 
    // ! the ticket service can be changed and it can be implemented using a different 
    // ! database like postgress and then this service will fail because we assumed it will
    // ! always be mongoose so dont to this in real projects (otherwise it will introduce coupling btw order and tickets)
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be provided')
], validateRequest, async (req: Request, res: Response) => {

  const { ticketId } = req.body;
  // find the ticket the user is trying to order
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new NotFoundError();
  }

  // make sure the ticket is not reserved
  const isReserved = await ticket.isReserved();

  if (isReserved) {
    throw new BadRequestError('ticket is already reserved');
  }

  // calculate expiration date for this order
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

  // build the order and save it to the database
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  });

  await order.save();
  // Publish an event saying that the order was created


  res.status(201).send(order)
})

export { router as newOrderRouter };