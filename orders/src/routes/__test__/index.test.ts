import request from "supertest";
import mongoose from "mongoose";

import { Ticket } from "../../models/ticket";
import { app } from "../../app";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "ticket",
    price: 20,
  });

  await ticket.save();
  return ticket;
};

it("fetches orders for a particular user", async () => {
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOneCookie = global.signin();
  const userTwoCookie = global.signin();

  await request(app)
    .post("/api/orders")
    .set("Cookie", userOneCookie)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwoCookie)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwoCookie)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwoCookie)
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(orderOne.ticket.id);
  expect(response.body[1].ticket.id).toEqual(orderTwo.ticket.id);
});
