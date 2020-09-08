import mongoose from "mongoose";
import { Password } from '../services/password'

//interface that describes properties to create new user
interface UserAttrs {
  email: string,
  password: string
}

// interface describing properties User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//interface describing the properties that User document has
interface UserDoc extends mongoose.Document {
  email: string,
  password: string
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
    }
  }
})

// if it is a async function need to call done in the end (for schema based functions)
userSchema.pre("save", async function (done) {
  if (this.isModified('password')) {
    const hashedPassword = await Password.toHash(this.get('password'));
    this.set('password', hashedPassword);
  }
  done();
})

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
}


const User = mongoose.model<UserDoc, UserModel>('User', userSchema);


export { User };