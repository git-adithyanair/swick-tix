import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@swick-tix/common";

import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../..//nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // Create an instance of the listener.
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket.
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Title",
    price: 20,
  });
  await ticket.save();

  // Fabricate fake data event.
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "New Title",
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create fake message object.
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure a ticket was updated.
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket.title).toEqual(data.title);
  expect(updatedTicket.price).toEqual(data.price);
  expect(updatedTicket.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function was call.
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event is recieved out of order", async () => {
  const { listener, data, msg, ticket } = await setup();

  // Set the version for event's data to be in the future.
  data.version = 10;

  // Call the onMessage function with the data and message
  // objects.
  try {
    await listener.onMessage(data, msg);
  } catch {}

  // Write assertions to make sure ack function was not call.
  expect(msg.ack).not.toHaveBeenCalled();
});
