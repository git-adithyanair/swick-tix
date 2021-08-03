import { Publisher, OrderCreatedEvent, Subjects } from "@swick-tix/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
