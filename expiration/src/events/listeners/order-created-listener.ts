import { Listener, OrderCreatedEvent, Subjects } from "@n19tickety/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting for: ', delay, 'seconds to process job');

    await expirationQueue.add({
      orderId: data.id
    }
      , {
        delay: delay
      }
    );

    msg.ack();
  }
}