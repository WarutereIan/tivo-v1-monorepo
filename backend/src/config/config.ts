import "dotenv/config";

export const config = {
  MONGO_URI: process.env.MONGO_STRING!,

  PAYSTACK_SECRET: process.env.PAYSTACK_SECRET_KEY!,

  //MONGO_URI: "mongodb+srv://nmwanik111:tiovobet1@cluster0.rrh7694.mongodb.net/",

  PORT: process.env.PORT,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 12, //expires in 12hours
};
