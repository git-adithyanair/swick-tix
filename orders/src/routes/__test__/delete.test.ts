import request from "supertest";
import mongoose from "mongoose";

import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "ticket",
    price: 20,
  });

  await ticket.save();
  return ticket;
};

it("marks an order as cancelled", async () => {
  const ticket = await buildTicket();
  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
});

it("publishes an event", async () => {
  const ticket = await buildTicket();
  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
