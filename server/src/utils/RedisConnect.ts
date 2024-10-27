import { createClient } from "redis";
require("dotenv").config();

// Create a Redis client
export const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  console.log("Redis Client Error:", err);
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
};
