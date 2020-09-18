import request from "supertest"
import mongoose from "mongoose"

import { app } from "../../app"
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";


it('fetches the order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 200
  });

  await ticket.save()

  const user = global.signin();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);


  // make a request to fetch the order

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id)

})

it('returns an error if one user tries to fetch order of another user', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 200
  });

  await ticket.save()

  const user = global.signin();
  const notAuthorizedUser = global.signin();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);


  // make a request to fetch the order

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', notAuthorizedUser)
    .send()
    .expect(401);

})