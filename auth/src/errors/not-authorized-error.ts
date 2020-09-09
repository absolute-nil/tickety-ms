import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
  statusCode = 401;
  message = 'not authorized';

  serializeErrors() {
    return [
      {
        message: this.message
      }
    ]
  }
  constructor() {
    super('user not authorized');

    Object.setPrototypeOf(this, NotAuthorizedError.prototype)
  }
}