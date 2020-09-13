import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}
export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;
  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      // manual acknowledgement to true so that if while processing the event something goes wrong 
      //we can follow up again and event will not be lost;
      .setDeliverAllAvailable()
      // send all events that were there after it starts up (only the first time it starts up if we use set durable name)
      .setManualAckMode(true)
      // wait time for acknowledgement of event after which event will be considered to be failed
      .setAckWait(this.ackWait)
      // send only those events which were not processed by this service 
      //(it will only work if we have a queue group name otherwise it will delete the durable name and it will keep sending all the events in history)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf-8')) // for buffer
  }
}

