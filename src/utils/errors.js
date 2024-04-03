export class BaseError extends Error {
  constructor(statusCode, originName, message) {
    super(message);
    this.statusCode = statusCode;
    this.originName = originName;
  }
}

export class BadRequestError extends BaseError {
  constructor(statusCode, originName, message) {
    super(statusCode, originName, message);
  }
}

export class NotFoundError extends BaseError {
  constructor(statusCode, originName, message) {
    super(statusCode, originName, message);
  }
}

export class AuthenticationError extends BaseError {
  constructor(statusCode, originName, message) {
    super(statusCode, originName, message);
  }
}

export class InternalServerError extends BaseError {
  constructor(statusCode, originName, message) {
    super(statusCode, originName, message);
  }
}
