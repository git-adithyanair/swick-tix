import { Publisher, Subjects, TicketCreatedEvent } from "@swick-tix/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
