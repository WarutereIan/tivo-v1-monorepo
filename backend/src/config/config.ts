import "dotenv/config";

export const config = {
  MONGO_URI: process.env.MONGO_STRING!,

  PAYSTACK_SECRET: process.env.PAYSTACK_SECRET_KEY!,

  KORA_SECRET: process.env.KORA_SECRET!,

  KORA_INITIALIZE_CHARGE_URL:
    "https://api.korapay.com/merchant/api/v1/charges/initialize",

  KORA_BULK_WITHDRAWAL_URL:
    "https://api.korapay.com/api/v1/transactions/disburse/bulk",

  KORA_NOTIFICATION_URL: process.env.KORA_NOTIFICATION_URL,

  KORA_WITHDRAWAL_NOTIFICATION_URL:
    process.env.KORA_WITHDRAWAL_NOTIFICATION_URL,

  KORA_REDIRECT_URL: process.env.KORA_REDIRECT_URL,

  MSG_BROKER_URL: process.env.MSG_BROKER_URL!,

  PORT: process.env.PORT,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 12, //expires in 12hours

  MONNIFY: {
    MONNIFY_API_KEY: process.env.MONNIFY_API_KEY!,
    MONNIFY_SECRET_KEY: process.env.MONNIFY_SECRET_KEY!,
    MONNIFY_BASE_URL_TEST: process.env.MONNIFY_BASE_URL_TEST!,
    MONNIFY_WALLET_ACCOUNT_NUMBER: process.env.MONNIFY_WALLET_ACCOUNT_NUMBER!,
    MONNIFY_CONTRACT_CODE: process.env.MONNIFY_CONTRACT_CODE!,
  },

  SOFTSWISS: {
    AUTH_TOKEN: process.env.AUTH_TOKEN!,
    CASINO_ID: process.env.CASINO_ID!,
    BACKEND_URL: process.env.BACKEND_URL!,
    USER_RETURN_URL: process.env.USER_RETURN_URL!,
    USER_DEPOSIT_URL: process.env.USER_DEPOSIT_URL!,
  },
};
