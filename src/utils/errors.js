export class BaseError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} originName
   * @param {string} message
   */
  constructor(statusCode, originName, message) {
    super(message);
    this.statusCode = statusCode;
    this.originName = originName;
  }
}

export class BadRequestError extends BaseError {
  /**
   * @param {number} statusCode
   * @param {string} originName
   * @param {string} message
   */
  constructor(statusCode, originName, message) {
    super(statusCode, originName, message);
  }
}

export class NotFoundError extends BaseError {
  /**
   * @param {number} statusCode
   * @param {string} originName
   * @param {string} message
   */
  constructor(statusCode, originName, message) {
    super(statusCode, originName, message);
  }
}

export class AuthenticationError extends BaseError {
  /**
   * @param {number} statusCode
   * @param {string} originName
   * @param {string} message
   */
  constructor(statusCode, originName, message) {
    super(statusCode, originName, message);
  }
}

export class InternalServerError extends BaseError {
  /**
   * @param {number} statusCode
   * @param {string} originName
   * @param {string} message
   */
  constructor(statusCode, originName, message) {
    super(statusCode, originName, message);
  }
}
