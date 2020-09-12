import express, { Request, Response } from "express";
import { requireAuth, validateRequest, NotFoundError } from "@n19tickety/common";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  }
  res.send(ticket);
})

export { router as showTicketRouter }