import { Listener, Subjects, TicketUpdatedEvent } from "@n19tickety/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";


export class TicketUpdatedListner extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();


    msg.ack();
  }
}

    // // @ts-ignore
    // if(msg.getRedeliveryCount() > process.env.MAX_RETIRES){

    // }