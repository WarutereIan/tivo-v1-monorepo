import { Connection } from "rabbitmq-client";
import { config } from "../config";
import { error } from "jquery";
import {
  initKora_W_Batch_Consumer,
  initKora_W_Req_Consumer,
} from "../../services/payments/withdrawals/korapay/koraBatch";

const brokerUrl = config.MSG_BROKER_URL;

export const RabbitMQ = new Connection(brokerUrl);

RabbitMQ.on("error", (err) => {
  console.error("RabbitMQ connection error", err);
});

RabbitMQ.on("connection", () => {
  console.log("RabbitMQ connected ");
  initKora_W_Req_Consumer();
  initKora_W_Batch_Consumer();
});
