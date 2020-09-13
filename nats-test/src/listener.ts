import nats, { Message } from "node-nats-streaming";
import { randomBytes } from 'crypto';

console.clear()

const stan = nats.connect('tickety', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('listner connected to NATS');

  const options = stan
    .subscriptionOptions()
    // manual acknowledgement to true so that if while processing the event something goes wrong we can follow up again and event will not be lost;
    .setManualAckMode(true);

  const subscription = stan.subscribe('ticket:created',
    // you need to specify the below string for creating a group for services (in case of horizontal scaling)
    'orders-service-queue-group',
    options);

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();
    if (typeof data === 'string') {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`)
    }

    // call this if using manual ack
    msg.ack()
  })
})