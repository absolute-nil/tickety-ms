import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { Order, OrderStatus } from "./order";

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByIdAndVersion(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
})

// for version control (concurrency)
ticketSchema.set('versionKey', 'version');
// ! dont use this during production
ticketSchema.plugin(updateIfCurrentPlugin);
// !use this instead
// ticketSchema.pre('save', function (done) {
//   // @ts-ignore
//   this.$where = {
//     version: this.get('version') - 1
//   };
//   done();
// })

// to the ticket model
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  const { id, ...rest } = attrs;
  return new Ticket({
    _id: attrs.id,
    ...rest
  });
}

// find by _id and version
ticketSchema.statics.findByIdAndVersion = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
}

ticketSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called 'isReserved' on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  // true / false
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };