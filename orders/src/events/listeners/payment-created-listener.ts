import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@n19tickety/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Complete
    });

    // ! ideally after this you should emit a order updated
    // ! event because .save() will increment the order version
    // ! but in this case when order is complete it requires no more
    // ! updates so it is left as is
    await order.save();

    msg.ack();
  }
}