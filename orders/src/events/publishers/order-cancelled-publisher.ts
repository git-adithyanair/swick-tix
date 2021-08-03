import { Publisher, OrderCancelledEvent, Subjects } from "@swick-tix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
