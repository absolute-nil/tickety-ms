import { OrderCreatedEvent, Publisher, Subjects } from "@n19tickety/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}