import express, { Request, Response } from "express";
import { requireAuth, validateRequest, NotFoundError } from "@n19tickety/common";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined
  });

  res.send(tickets);
})

export { router as indexTicketRouter }