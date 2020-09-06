import express from "express";

//route handlers
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/sign-in";
import { signUpRouter } from "./routes/sign-up";
import { signOutRouter } from "./routes/sign-out";

// error
import { NotFoundError } from "./errors/not-found-error";

//middleware
import { errorHandler } from "./middlewares/error-handler";


const app = express();

app.use(express.json());

//routes
app.use("/api/users/currentuser", currentUserRouter);
app.use("/api/users/signup", signUpRouter);
app.use("/api/users/signin", signInRouter);
app.use("/api/users/signout", signOutRouter);

// if route does not exist
app.get("*", () => {
  throw new NotFoundError();

})

// middleware
app.use(errorHandler);

app.listen(3000, () => {
  console.log("auth service running on port 3000");
})