import { Publisher, PaymentCreatedEvent, Subjects } from "@swick-tix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
