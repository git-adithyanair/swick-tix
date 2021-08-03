import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties required
// to create a new user.
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a
// User model has (methods belonging to the User collection).
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a
// User document has (fields each User document has)
// after it has been added to the database.
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// Defines the actual schema for the User model.
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // Modifies the User object when it is sent to the
    // client in JSON format (see sign-up.ts).
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// Function that is run right before a User document is
// saved. The done() function must be called at the end
// of the function.
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// Used to define a new User object with TypeScript.
// This helps TypeScript perform typechecking when
// creating a new User.
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// Creates actual User model with specified schemas and
// interfaces above.
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
