import { Listener, Subjects, TicketUpdatedEvent } from "@n19tickety/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByIdAndVersion(data);

    if (!ticket) {
      //* if the ticket gets rejected more than MAX_RETIRES times then it will
      //* be acknowledged and will be discarded
      // @ts-ignore
      // if (msg.getRedeliveryCount() > process.env.MAX_RETIRES) {
      //   msg.ack();
      // }
      throw new Error('Ticket not found');
    }

    //!while using mongoose-update if current
    const { title, price } = data;
    ticket.set({ title, price });

    //!while not using mongoose-update if current
    // const { title, price, version } = data;
    // ticket.set({ title, price, version });

    await ticket.save();

    msg.ack();
  }
}

