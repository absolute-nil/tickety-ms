import { OrderCancelledEvent, Publisher, Subjects } from "@n19tickety/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}