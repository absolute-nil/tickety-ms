export const stripe = {
  charges: {
    // mock resolved value creates a promise and
    // instantly resolves itself
    // use it for functions that you do await on
    create: jest.fn().mockResolvedValue({})
  }
}