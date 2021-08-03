// Used to "mock" the behavior of the natsWrapper that is used in
// our tests. This is becasue the tests cannot connect to the NATS
// streaming server because the client was not initialized.
export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
