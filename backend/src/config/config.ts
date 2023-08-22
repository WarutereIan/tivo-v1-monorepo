import "dotenv/config";

export const config = {
  MONGO_URI: process.env.MONGO_STRING!,

  PAYSTACK_SECRET: process.env.PAYSTACK_SECRET_KEY!,

  KORA_SECRET: process.env.KORA_SECRET!,

  KORA_INITIALIZE_CHARGE_URL:
    "https://api.korapay.com/merchant/api/v1/charges/initialize",

  KORA_NOTIFICATION_URL: process.env.KORA_NOTIFICATION_URL,

  KORA_REDIRECT_URL: process.env.KORA_REDIRECT_URL,

  PORT: process.env.PORT,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 12, //expires in 12hours
};
