import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@swick-tix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
