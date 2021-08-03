import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

// Used to simulate the behavior of the natsWrapper in our
// tests.
jest.mock("../nats-wrapper");

let mongo: any;

// This function is run before all tests begin.
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// This function is run before each test begins.
beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// This function is run after all tests begin.
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// Global function that creates a fake cookie used in testing
// routes that require authentication.
global.signin = (id?: string) => {
  // Build a JWT payload.
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // Create JWT.
  const token = jwt.sign(payload, process.env.JWT_KEY);

  // Build a session object. { "jwt": MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON.
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64.
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // Return a string that is the cookie with the encoded payload.
  return [`express:sess=${base64}`];
};
