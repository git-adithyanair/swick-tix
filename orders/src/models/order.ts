import mongoose from "mongoose";
import { OrderStatus } from "@swick-tix/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { TicketDoc } from "./ticket";

// An interface that describes the properties required
// to create a new order.
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

// An interface that describes the properties that a
// Order document has (fields each Order document has)
// after it has been added to the database.
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

// An interface that describes the properties that a
// Order model has (methods belonging to the Order collection).
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// Defines the actual schema for the Order model.
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    // Modifies the Order object when it is sent to the
    // client in JSON format.
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Used to support Optimistic Concurrency Control in our database.
// This ensures that when events are received, they are processed
// in order to make sure that the database across services are
// consistent.
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

// Used to define a new Order object with TypeScript.
// This helps TypeScript perform typechecking when
// creating a new Order.
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

// Creates actual Order model with specified schemas and
// interfaces above.
const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order, OrderStatus };
