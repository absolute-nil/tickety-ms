import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@n19tickety/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    price: 10,
    title: 'new concert',
    userId: 'jvnbrovli'
  }

  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }
  // return all of this stuff
  return { msg, data, ticket, listener };
};

it('finds, updates and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack if events come out of order', async () => {
  const { msg, data, ticket, listener } = await setup();

  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (e) {
  }

  expect(msg.ack).not.toHaveBeenCalled();

})