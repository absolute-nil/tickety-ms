import { ExpirationCompleteEvent, Publisher, Subjects } from "@n19tickety/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;

}