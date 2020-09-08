import express, { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { body, } from "express-validator";
import { validateRequest } from '../middlewares/validate-request';
import { User } from "../models/user";
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';
const router = express.Router();

router.post("/", [
  body('email')
    .isEmail()
    .withMessage("provide a valid email"),
  body('password')
    .trim()
    .notEmpty()
    .withMessage("must supply an password")
], validateRequest, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new BadRequestError("Invalid Credentials");
  }
  const passwordMatch = await Password.compare(existingUser.password, password);

  if (!passwordMatch) {
    throw new BadRequestError("Invalid Credentials");
  }

  //generate jwt
  const userJwt = jwt.sign({
    id: existingUser._id,
    email: existingUser.email
  }, process.env.JWT_KEY!);

  // store it on session
  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(existingUser);
})

export { router as signInRouter };