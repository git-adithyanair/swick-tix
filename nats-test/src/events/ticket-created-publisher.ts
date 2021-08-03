import { Publisher } from "./base-publisher";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subjects";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  // Can also do the below because "readonly" keyword ensures
  // variable is not changed in the future.
  //
  // readonly subject = Subjects.TicketCreated;
}
