import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteEvent, OrderStatus } from "@swick-tix/common";

import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../..//nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";

const setup = async () => {
  // Create an instance of the listener.
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create and save a ticket.
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Title",
    price: 20,
  });
  await ticket.save();

  // Create a new order.
  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // Fabricate fake data event.
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // Create fake message object.
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket, order };
};

it("updates the order status to cancelled", async () => {
  const { listener, data, msg, order } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure a order was updated.
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
});

it("emits an OrderCancelled event", async () => {
  const { listener, data, msg, order } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function was call.
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function was call.
  expect(msg.ack).toHaveBeenCalled();
});
