import { Ticket } from "../ticket"

// done is to help jest figure out when a function is done 
// generally used with async await things
it('implements optimistic concurrency control', async (done) => {
  // create an instance of ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '1234'
  })

  // save the ticket tot the database
  await ticket.save()

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error

  try {
    await secondInstance!.save();
  } catch (error) {
    // to tell jest function execution is done
    return done();
  }

  // should not reach here as above func should
  // throw and error and catch block returns
  throw new Error("Should not reach this point");


  // ! the below implementation does not work with ts
  //   expect(async () => {
  //     await secondInstance!.save();
  //   }).toThrow();
})

it('increments the version number on multiple saves', async () => {

  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: '123'
  })

  await ticket.save();

  expect(ticket.version).toEqual(0);
  await ticket.save()
  expect(ticket.version).toEqual(1);
  await ticket.save()
  expect(ticket.version).toEqual(2);
})