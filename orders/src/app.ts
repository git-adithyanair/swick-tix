import express from "express";
import cookieSession from "cookie-session";

// Required to ensure errors thrown in an async block don't cause issues.
import "express-async-errors";

import { errorHandler, NotFoundError, currentUser } from "@swick-tix/common";

import { createOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes/index";
import { deleteOrderRouter } from "./routes/delete";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: false, // WAS THIS BEFORE DEPLOYMENT: process.env.NODE_ENV !== "test"
  })
);

app.use(currentUser);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

// Ensures that any routes that aren't defined are handled gracefully by
// throwing a NotFoundError.
app.all("*", async () => {
  throw new NotFoundError();
});

// Required to use the error handler middleware.
app.use(errorHandler);

export { app };
