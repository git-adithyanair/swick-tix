import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelledEvent, OrderStatus } from "@swick-tix/common";

import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../..//nats-wrapper";
import { Order } from "../../../models/order";

const setup = async () => {
  // Create an instance of the listener.
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create a new order.
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  // Fabricate fake data event.
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    },
  };

  // Create fake message object.
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("cancels specified order", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure a order was updated.
  const order = await Order.findById(data.id);
  expect(order.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data and message
  // objects.
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function was call.
  expect(msg.ack).toHaveBeenCalled();
});
