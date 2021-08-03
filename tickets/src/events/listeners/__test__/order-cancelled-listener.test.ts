import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelledEvent, OrderStatus, Subjects } from "@swick-tix/common";

import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../..//nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // Create an instance of the listener.
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save a ticket.
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "Title",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId: orderId });

  await ticket.save();

  // Fabricate fake data event.
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // Create fake message object.
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("removes the orderId of the ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure the ticket's orderId
  // was removed.
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket.orderId).not.toBeDefined();
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

  expect(ticketUpdatedEventName).toEqual(Subjects.TicketUpdated);
});
