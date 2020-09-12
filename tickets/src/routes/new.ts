import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@n19tickety/common";
import { Ticket } from "../models/ticket";


const router = express.Router();

router.post('/', requireAuth, [
  body('title')
    .not().isEmpty()
    .withMessage('title is required'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {
  const { title, price } = req.body;

  const ticket = Ticket.build({
    title,
    price,
    userId: req.currentUser!.id
  })

  await ticket.save()

  res.status(201).send(ticket);
})


export { router as createTicketRouter };