import express, { Request, Response } from 'express';
import { body, } from "express-validator";
import jwt from 'jsonwebtoken'

import { User } from "../models/user";
import { BadRequestError, validateRequest } from '@n19tickety/common';

const router = express.Router();

router.post("/", [
  body("email")
    .isEmail()
    .withMessage("Email must be valid"),
  body("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("password must be between 4 and 20 character long"),
], validateRequest, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new BadRequestError('Email already in use');
  }

  const user = User.build({
    email,
    password
  })
  await user.save();


  //generate jwt
  const userJwt = jwt.sign({
    id: user._id,
    email: user.email
  }, process.env.JWT_KEY!);

  // store it on session
  req.session = {
    jwt: userJwt,
  };

  res.status(201).send(user);

})

export { router as signUpRouter };