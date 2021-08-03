import { Ticket } from "../ticket";

it("implements optimistic concurrency control (OCC)", async () => {
  // Create an instance of a ticket.
  const ticket = Ticket.build({
    title: "Title",
    price: 5,
    userId: "123",
  });

  // Save the ticket to the database.
  await ticket.save();

  // Fetch the ticket twice.
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched. Both
  // have a version number of 0.
  firstInstance.set({ price: 10 });
  secondInstance.set({ price: 15 });

  // Save the first fetched ticket. This updates the version of
  // the ticket to 2.
  await firstInstance.save();

  // Save the second fetched ticket and expect an error. This
  // is because the version number on the second instance of
  // the ticket is outdated since the first instance saved
  // its changes and updated the version number to 2.
  try {
    await secondInstance.save();
  } catch (err) {
    return;
  }

  throw new Error("Should not reach this point.");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "Title",
    price: 5,
    userId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  await ticket.save();
  expect(ticket.version).toEqual(3);
});
