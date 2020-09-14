import { Publisher, Subjects, TicketCreatedEvent} from "@n19tickety/common"

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}