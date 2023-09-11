import { RabbitMQ } from "./rabbitmq";

export const Publisher = RabbitMQ.createPublisher({
  confirm: true,
  maxAttempts: 3,
  exchanges: [
    { exchange: "deposits", type: "topic" },
    { exchange: "withdrawalRequests", type: "topic" },
    { exchange: "koraWithdrawalRequestsBatches", type: "topic" },
    
  ],
});
