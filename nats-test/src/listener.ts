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
    // manual acknowledgement to true so that if while processing the event something goes wrong 
    //we can follow up again and event will not be lost;
    .setManualAckMode(true)
    // send all events that were there after it starts up (only the first time it starts up if we use set durable name)
    .setDeliverAllAvailable()
    // send only those events which were not processed by this service 
    //(it will only work if we have a queue group name otherwise it will delete the durable name and it will keep sending all the events in history)
    .setDurableName('orders-service');

  const subscription = stan.subscribe('ticket:created',
    // you need to specify the below string for creating a group for services (in case of horizontal scaling) (queue group name)
    'queue-group-name',
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
// for nodemon SIGUSR2
// this executes stan.close just after we hit ctrl + c or rs and then closes the window
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())