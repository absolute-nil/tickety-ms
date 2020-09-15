import mongoose from "mongoose";
import express, { Request, Response } from "express";
import { requireAuth, validateRequest, } from "@n19tickety/common";
import { body } from "express-validator";
const router = express.Router();


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
  res.send({})
})

export { router as newOrderRouter };