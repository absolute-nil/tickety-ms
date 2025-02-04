import { PaymentCreatedEvent, Publisher, Subjects } from "@n19tickety/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  readonly subject = Subjects.PaymentCreated
}