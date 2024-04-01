import { RabbitMQ } from "./rabbitmq";

export const Publisher = RabbitMQ.createPublisher({
  confirm: true,
  maxAttempts: 3,
  exchanges: [
    { exchange: "deposits", type: "topic" },
    { exchange: "withdrawalRequests", type: "topic" },
    { exchange: "koraWithdrawalRequestsBatches", type: "topic" },
    { exchange: "monnifyWithdrawalRequestsBatches", type: "topic" },
    { exchange: "monnifyDepositsResponses", type: "topic" },
    { exchange: "monnifyWithdrawalsResponses", type: "topic" },
    { exchange: "sswissBetActions", type: "topic" },
    { exchange: "sswissWinActions", type: "topic" },
    { exchange: "EVMDepositEvents", type: "topic" },
  ],
});
