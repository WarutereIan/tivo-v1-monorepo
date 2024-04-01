import { Connection } from "rabbitmq-client";
import { config } from "../config";
import {
  initKora_W_Batch_Consumer,
  initKora_W_Req_Consumer,
} from "../../services/payments/withdrawals/korapay/koraBatch";
import {
  initMonnify_W_Batch_Consumer,
  initMonnify_W_Req_Consumer,
} from "../../services/payments/withdrawals/monnify/monnifyBatch";
import { processMonnifyDepoResponses } from "../../services/processQueues/processDeposits/monnifyDeposits";
import { initMonnifyWithdrawalResponseConsumer } from "../../services/processQueues/processDeposits/monnifyWithdrawals";
import { processSoftSwissBetActions } from "../../services/sswiss_worker/sswissBetsConsumer";
import { processSoftSwissWinActions } from "../../services/sswiss_worker/sswissWinsConsumer";
import { processEVMDeposits } from "../../services/processQueues/processDeposits/EVMDeposits";

const brokerUrl = config.MSG_BROKER_URL;

export const RabbitMQ = new Connection(brokerUrl);

RabbitMQ.on("error", (err) => {
  console.error("RabbitMQ connection error", err);
});

RabbitMQ.on("connection", () => {
  console.log("RabbitMQ connected ");
  initKora_W_Req_Consumer();
  initKora_W_Batch_Consumer();
  initMonnify_W_Req_Consumer();
  initMonnify_W_Batch_Consumer();
  processMonnifyDepoResponses();
  initMonnifyWithdrawalResponseConsumer();
  processSoftSwissBetActions();
  processSoftSwissWinActions();
  processEVMDeposits();
});
