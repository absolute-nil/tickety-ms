import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@n19tickety/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';


// ! the mock is unit test and testing the real stripe api call is integration test
// ! the mock isnt a realistic test but can be used
// !either use mock implementation or directly reach to stripe
//jest.mock('../../stripe');

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
  const price = Math.floor(Math.random() * 100000);
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
  // * integration test
  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100
  });

  expect(stripeCharge).toBeDefined()
  expect(stripeCharge!.currency).toEqual(currency);

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  })

  //! find one returns null so toBeDefined will always return true
  // therefore use not toBeNull instead
  expect(payment).not.toBeNull();

  // ! below are things you would test with mock function
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // const chargeResult = await (stripe.charges.create as jest.Mock).mock.results[0].value;
  // expect(chargeOptions.source).toEqual(source);
  // expect(chargeOptions.amount).toEqual(price * 100);
  // expect(chargeOptions.currency).toEqual(currency);
  // const payment = await Payment.findOne({
  //   orderId: order.id,
  //   stripeId: chargeResult.id,
  // });

  // expect(payment).toBeDefined();
  // expect(payment!.orderId).toEqual(order.id);
  // expect(payment!.stripeId).toEqual(chargeResult.id);

});