import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it('returns a 404 if the provider id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 20
    })
    .expect(404)
})

it('returns a 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'title',
      price: 20
    })
    .expect(401)
})

it('returns a 401 if user does not own the ticket', async () => {
  const title = 'title';
  const price = 10;

  const response = await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({
      title,
      price
    })
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'tifbtle',
      price: 2000
    })
    .expect(401)
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()

  expect(ticketResponse.body.title).toEqual(title)
  expect(ticketResponse.body.price).toEqual(price)
})

it('returns a 400 if the title and price provided are invalid', async () => {
  const title = 'title';
  const price = 10;
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set('Cookie', cookie)
    .send({
      title,
      price
    })
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 2000
    })
    .expect(400)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({

      price: 2000
    })
    .expect(400)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'rhrse',
      price: -2000
    })
    .expect(400)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'rhrse',
    })
    .expect(400)
})

it('updates the ticket if valid inputs are provided', async () => {
  const title = 'title';
  const price = 10;
  const updatedTitle = 'ourfbved';
  const updatedPrice = 8309;
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set('Cookie', cookie)
    .send({
      title,
      price
    })
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: updatedTitle,
      price: updatedPrice
    })
    .expect(200)

  const updatedResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()

  expect(updatedResponse.body.title).toEqual(updatedTitle);
  expect(updatedResponse.body.price).toEqual(updatedPrice);

})