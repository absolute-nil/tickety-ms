// faking the nats wrapper for tests

// natsWrapper gets exported from nats-wrapper.ts
export const natsWrapper = {
  // the only thing that the new and update publisher cares is 
  // the client
  client: {
    // the publish function mock which takes the arguements and invokes callback
    // jest.fn() helps us in testing the nats implementation... 
    // jest.fn() can keep track if this function is called or not by the tests
    // .mockImplementation is the implementation of the function that publish expects
    publish: jest.fn().mockImplementation(
      (subject: string, data: string, callback: () => void) => {
        callback();
      })
  }
}