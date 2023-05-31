import { connect } from "mongoose";
import { config } from "./config";
import { Redis } from "ioredis";

export const connectDB = async () => {
  console.log(`- - -`.repeat(10));
  try {
    const options = {
      useUnifiedTopology: true,
      keepAlive: true,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    };
    const db = await connect(config.MONGO_URI, options);
    console.log("Connected to MongoDB ✅✅✅");
    return db;
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export const RedisClient = new Redis();
