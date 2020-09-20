import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@n19tickety/common';
import { stripe } from '../../stripe';

jest.mock('../../stripe');

it('returns an 404 when purchasing an order that does not exist', async () => {

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'djcndoc',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns an 401 when purchasing an order that does not belong to user', async () => {

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'djcndoc',
      orderId: order.id,
    })
    .expect(401);
});

it('returns an 400 when purchasing a cancelled order', async () => {
  const user = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Cancelled,
    userId: user,
    version: 0
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(user))
    .send({
      token: 'djcndoc',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const user = mongoose.Types.ObjectId().toHexString();
  const price = 10;
  const currency = 'inr';
  //* tok_visa is for testing (provided by stripe)
  const source = 'tok_visa';
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: price,
    status: OrderStatus.Created,
    userId: user,
    version: 0
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(user))
    .send({
      token: source,
      orderId: order.id
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual(source);
  expect(chargeOptions.amount).toEqual(price * 100);
  expect(chargeOptions.currency).toEqual(currency);
});