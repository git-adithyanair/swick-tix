import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus, Subjects } from "@swick-tix/common";

import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../..//nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // Create an instance of the listener.
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket.
  const ticket = Ticket.build({
    title: "Title",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  // Fabricate fake data event.
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // Create fake message object.
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("sets the orderId of the ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure the ticket's orderId
  // was set.
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function was call.
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  const ticketUpdatedEventName = (natsWrapper.client.publish as jest.Mock).mock
    .calls[0][0];

  expect(data.id).toEqual(ticketUpdatedData.orderId);
  expect(ticketUpdatedEventName).toEqual(Subjects.TicketUpdated);
});
