import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
// it might look as if we are calling the real nats wrapper but the jest.mock will redirect this req
// to the fake nats wrapper
import { natsWrapper } from '../../nats-wrapper'
it('has a route handler listening to /app/tickets for post requests', async () => {
  const response = await request(app)
    .post("/api/tickets")
    .send({});
  expect(response.status).not.toEqual(404);
})

it('can only be accessed if user is signed in', async () => {
  const response = await request(app)
    .post("/api/tickets")
    .send({})
    .expect(401);
})

it('returns status other than 401 if user signed in', async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
})


it('returns an error if invalid title is provided', async () => {
  await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10
    }).expect(400);

  await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({
      price: 10
    }).expect(400);
})

it('returns an error if invalid price is provided', async () => {
  await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: -10
    }).expect(400);

  await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({
      title: 'ifcjbv ie'
    }).expect(400);
})

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  const title = 'title';
  const price = 20;
  await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({
      title,
      price
    }).expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(price);
  expect(tickets[0].title).toEqual(title);
})

it('publishes an event', async () => {
  const title = 'title';
  const price = 20;
  await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({
      title,
      price
    }).expect(201);

  // check if the fake nats wrapper was invoked
  expect(natsWrapper.client.publish).toHaveBeenCalled();
})