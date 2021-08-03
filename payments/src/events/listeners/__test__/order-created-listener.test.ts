import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@swick-tix/common";

import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../..//nats-wrapper";
import { Order } from "../../../models/order";

const setup = async () => {
  // Create an instance of the listener.
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Fabricate fake data event.
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: 10,
    },
  };

  // Create fake message object.
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure a order was updated.
  const order = await Order.findById(data.id);
  expect(order.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function was call.
  expect(msg.ack).toHaveBeenCalled();
});
