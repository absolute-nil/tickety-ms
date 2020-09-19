import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";
const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }

  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
    natsWrapper.client.on('close', () => {
      // to immediately tell nats to close the connection when it goes offline (so that there is no delay in events)
      console.log('NATS connection closed');
      process.exit()
    })
    // for nodemon SIGUSR2
    // this executes stan.close just after we hit ctrl + c or rs and then closes the window
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())
    // process.on('SIGUSR2', () => natsWrapper.client.close())

    new OrderCreatedListener(natsWrapper.client).listen();

  } catch (e) {
    console.error(e);
  }
}

start();

