import nats from "node-nats-streaming";
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listner'

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
  new TicketCreatedListener(stan).listen();
})
// for nodemon SIGUSR2
// this executes stan.close just after we hit ctrl + c or rs and then closes the window
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())


