import nats, { Message } from "node-nats-streaming";
import { randomBytes } from 'crypto';

console.clear()

const stan = nats.connect('tickety', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('listner connected to NATS');

  stan.on('close', () => {
    // to immediately tell nats to close the connection when it goes offline (so that there is no delay in events)
    console.log('NATS connection closed');
    process.exit()
  })
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

// this executes stan.close just after we hit ctrl + c or rs and then closes the window
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())