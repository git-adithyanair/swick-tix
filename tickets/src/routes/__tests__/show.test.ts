import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";

it("returns a 404 if the ticket is not found", async () => {
  await request(app)
    .get(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "Title", price: 10 })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual("Title");
  expect(ticketResponse.body.price).toEqual(10);
});
