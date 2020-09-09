import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// a more precise definition of what we get back from payload to help augment currentUser to req 
interface UserPayload {
  id: string;
  email: string;
}

// to augment currentuser property to req
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // req.session? will evaluate to false if req.session does not exist.
  // its a shortcut for !req.session || !req.session.jwt
  if (!req.session?.jwt) {
    return next();
  }
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload

  } catch (e) {
  }

  next();
};