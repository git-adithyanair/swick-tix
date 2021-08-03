import { Stan } from "node-nats-streaming";

import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      // The publisher has sent the data object to the
      // NATS streaming server, more specifically the
      // channel represented by "this.subject".
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log(`Event published to ${this.subject}.`);
        resolve();
      });
    });
  }
}
