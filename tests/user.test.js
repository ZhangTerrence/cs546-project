import mongoose from "mongoose";
import app from "../src/app.js";
import env from "../src/config/env.js";
import request from "supertest";

beforeEach(async () => {
  try {
    await mongoose.connect(env.MONGO_CONNECTION_STRING);
  } catch (error) {
    console.error(`Error connecting: ${error.message}`);
    process.exit(1);
  }
});

afterEach(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error cleaning up database.");
    process.exit(1);
  }
});

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const res = await request(app).get("/api/users");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});
