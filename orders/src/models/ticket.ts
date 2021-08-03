/**
 * This Ticket model is very similar to the one defined in the
 * tickets service, but cannot be put into the common module.
 * This is because this definition for Ticket only includes
 * fields that the orders service cares about.
 */

import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { Order, OrderStatus } from "./order";

// An interface that describes the properties required
// to create a new ticket.
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// An interface that describes the properties that a
// Ticket model has (methods belonging to the Ticket collection).
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

// An interface that describes the properties that a
// Ticket document has (fields each Ticket document has)
// after it has been added to the database.
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
  version: number;
}

// Defines the actual schema for the Ticket model.
const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    // Modifies the Ticket object when it is sent to the
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
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

// Used to define a new Ticket object with TypeScript.
// This helps TypeScript perform typechecking when
// creating a new Ticket.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

// Abstract method to find a ticket by their id and version.
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

// Needs to be used with the function keyword.
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this as any,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

// Creates actual Ticket model with specified schemas and
// interfaces above.
const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
