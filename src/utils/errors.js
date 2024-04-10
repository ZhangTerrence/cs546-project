export class BaseError extends Error {
  constructor(statusCode, origin, message) {
    super(message);
    this.statusCode = statusCode;
    this.origin = origin;
  }

  toString = () => {
    return `${this.statusCode} - ${this.origin}: ${this.message}`;
  };
}

export class BadRequestError extends BaseError {
  constructor(statusCode, origin, message) {
    super(statusCode, origin, message);
  }
}

export class NotFoundError extends BaseError {
  constructor(statusCode, origin, message) {
    super(statusCode, origin, message);
  }
}

export class AuthenticationError extends BaseError {
  constructor(statusCode, origin, message) {
    super(statusCode, origin, message);
  }
}

export class InternalServerError extends BaseError {
  constructor(statusCode, origin, message) {
    super(statusCode, origin, message);
  }
}
