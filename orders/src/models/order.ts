import mongoose from "mongoose";
import { OrderStatus } from "@n19tickety/common"

import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// we do this so that other files in orders service needing this know that it is an order model implementation
export { OrderStatus };
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  version: number;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {

  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },
  expiresAt: {
    type: mongoose.Schema.Types.Date
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

// for version control (concurrency)
orderSchema.set('versionKey', 'version');
// ! dont use this during production
orderSchema.plugin(updateIfCurrentPlugin);
// !use this instead
// orderSchema.pre('save', function (done) {
//   // @ts-ignore
//   this.$where = {
//     version: this.get('version') - 1
//   };
//   done();
// })
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };

