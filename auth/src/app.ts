import express from "express";
import cookieSession from "cookie-session";

// Required to ensure errors thrown in an async block don't cause issues.
import "express-async-errors";

import { currentUserRouter } from "./routes/current-user";
import { signUpRouter } from "./routes/sign-up";
import { signInRouter } from "./routes/sign-in";
import { signOutRouter } from "./routes/sign-out";
import { errorHandler, NotFoundError } from "@swick-tix/common";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUserRouter);
app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);

// Ensures that any routes that aren't defined are handled gracefully by
// throwing a NotFoundError.
app.all("*", async () => {
  throw new NotFoundError();
});

// Required to use the error handler middleware.
app.use(errorHandler);

export { app };
