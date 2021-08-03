import request from "supertest";
import { app } from "../../app";

it("returns 200 with details about current user", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send({})
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("returns 200 with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send({})
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
