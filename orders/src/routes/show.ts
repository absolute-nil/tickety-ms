import express, { Request, Response } from "express";
import { requireAuth, NotFoundError, NotAuthorizedError } from "@n19tickety/common";

import { Order } from "../models/order";

const router = express.Router();

// @url: /api/orders/:orderId
// method: GET
// returns an order
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId).populate('ticket');

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }
  res.send(order);
})

export { router as showOrderRouter };