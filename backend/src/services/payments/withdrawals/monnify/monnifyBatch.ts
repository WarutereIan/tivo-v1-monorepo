/**
 * @dev withdrawal requests are grouped into batches for posting to monnify
 */

import { randomUUID } from "crypto";
import { config } from "../../../../config/config";
import { Publisher } from "../../../../config/rabbitmq/publishers";
import { RabbitMQ } from "../../../../config/rabbitmq/rabbitmq";
import { generateAccessToken } from "../../deposits/monnify";
import axios from "axios";
import { v4 } from "uuid";

let batchArray: any[] = [];

let baseUrl = config.MONNIFY.MONNIFY_BASE_URL_TEST;

export const initMonnify_W_Req_Consumer = () => {
  const Consumer = RabbitMQ.createConsumer(
    {
      queue: "withdrawals.monnify",
      queueOptions: { durable: true },
      qos: { prefetchCount: 2 },
      exchanges: [{ exchange: "withdrawalRequests", type: "topic" }],
      queueBindings: [
        { exchange: "withdrawalRequests", routingKey: "withdrawals.monnify" },
      ],
    },
    async (msg: any) => {
      try {
        const monnifyToken = await generateAccessToken();

        if (batchArray.length == 5) {
          Publisher.send(
            {
              exchange: "monnifyWithdrawalRequestsBatches",
              routingKey: "withdrawals.monnify.batches",
            },
            batchArray
          );
          //console.log("batch size", batchSize, "batch", batch);

          batchArray.length = 0;
        }
        batchArray.push(msg.body);

        /* const axiosConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${baseUrl}/api/v2/disbursements/single`,
          headers: {
            Authorization: `Bearer ${monnifyToken}`,
          },
          data: msg.body,
          //data: monnifyBatchData,
        };

        const response = await axios(axiosConfig);

        console.log(response.data); */
      } catch (err) {
        console.error(err);
      }
    }
  );

  //Consumer.on("error", (err) => console.error(err));

  Consumer.on("ready", () =>
    console.log("Monnify Consumer successfully created")
  );
};

export const initMonnify_W_Batch_Consumer = () => {
  const BatchConsumer = RabbitMQ.createConsumer(
    {
      queue: "withdrawals.monnify.batches",
      queueOptions: { durable: true },
      qos: { prefetchCount: 2 },
      exchanges: [
        { exchange: "monnifyWithdrawalRequestsBatches", type: "topic" },
      ],
      queueBindings: [
        {
          exchange: "monnifyWithdrawalRequestsBatches",
          routingKey: "withdrawals.monnify.batches",
        },
      ],
    },
    async (requestsBatch) => {
      try {
        let batch_reference = v4();

        const monnifyToken = await generateAccessToken();
        const monnifyBatchData = {
          title: "Monnify batch withdrawal",
          batchReference: batch_reference,
          narration: "Test Withdrawals",
          sourceAccountNumber: config.MONNIFY.MONNIFY_WALLET_ACCOUNT_NUMBER,
          onValidationFailure: "CONTINUE",
          notificationInterval: 25,
          transactionList: requestsBatch.body,
        };
        const axiosConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${baseUrl}/api/v2/disbursements/batch`,
          headers: {
            Authorization: `Bearer ${monnifyToken}`,
          },
          //data: JSON.stringify(monnifyBatchData),
          data: monnifyBatchData,
        };

        const response = await axios(axiosConfig);

        console.log(response.data);
      } catch (err) {
        console.error(err);
      }
    }
  );

  BatchConsumer.on("error", (err) => console.error(err));

  BatchConsumer.on("ready", () =>
    console.log("Monnify Batch Withdrawals Consumer successfully created")
  );
};
