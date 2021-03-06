import mongoose from "mongoose";
import { app } from "./app";

// Startup function.
const start = async () => {
  console.log("Starting Auth...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined.");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined.");
  }
  try {
    console.log("Connecting to mongodb/auth...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to mongodb/auth.");
  } catch (err) {
    console.log(err);
  }
  app.listen(3000, () => {
    console.log("Auth listening on port 3000.");
  });
};

start();
