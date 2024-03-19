import bcryptjs from "bcryptjs";

const SALT_LENGTH = 10;

export const hashPassword = async (password) => {
  return await bcryptjs.hash(password, SALT_LENGTH);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcryptjs.compare(password, hashedPassword);
};
