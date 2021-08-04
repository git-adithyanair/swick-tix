import mongoose from "mongoose";

import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

// Startup function.
const start = async () => {
  console.log("Starting Payments...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined.");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined.");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URI must be defined.");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined.");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined.");
  }
  try {
    console.log("Connecting to NATS...");
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed.");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    console.log("Connecting to mongodb/tickets...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to mongodb/tickets.");
  } catch (err) {
    console.log(err);
  }
  app.listen(3000, () => {
    console.log("Payments listening on port 3000.");
  });
};

start();
