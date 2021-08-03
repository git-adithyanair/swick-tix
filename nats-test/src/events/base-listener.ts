import { Message, Stan } from "node-nats-streaming";

import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message): void;

  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  // This is how you add options to the listener.
  // The ManualAck(nowledgement)Mode allows us to
  // manually acknowledge the event was received
  // and successfully processed. If the message was
  // not acknowledged. NATS sends the event to another
  // listener of the same channel. The DeliverAllAvailable
  // option sends all events to the listener if it ever
  // goes down. The DurableName option allows us to
  // keep track of the events that we have processed
  // previously so they are not sent back to the listener.
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  // The queueGroupName argument allows us to ensure
  // that the same event is not sent to multiple instances
  // of the same listener that has joined the queue group.
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    // The listener has received the data object from
    // the NATS streaming server, more specifically
    // the ticket:created channel.
    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}
