import { randomUUID } from "crypto";
import { config } from "../../../../config/config";
import { Publisher } from "../../../../config/rabbitmq/publishers";
import { RabbitMQ } from "../../../../config/rabbitmq/rabbitmq";
import axios from "axios";

let batchSize = 0;
let batchArray: any[] = [];
//let batch: { [index: number]: any } = {};
const bulkWithdrawalUrl = config.KORA_BULK_WITHDRAWAL_URL;
const koraSecret = config.KORA_SECRET;

//Withdrawal request consumer
//this batches up withdrawal requests and submits the batch to another queue, so that requests are paid out in batches
export const initKora_W_Req_Consumer = () => {
  const Consumer = RabbitMQ.createConsumer(
    {
      queue: "withdrawals.korapay",
      queueOptions: { durable: true },
      qos: { prefetchCount: 2 },
      exchanges: [{ exchange: "withdrawalRequests", type: "topic" }],
      queueBindings: [
        { exchange: "withdrawalRequests", routingKey: "withdrawals.korapay" },
      ],
    },
    async (msg: any) => {
      if (batchArray.length == 5) {
        Publisher.send(
          {
            exchange: "koraWithdrawalRequestsBatches",
            routingKey: "withdrawals.korapay.batches",
          },
          batchArray
        );
        //console.log("batch size", batchSize, "batch", batch);

        batchArray.length = 0;
      }
      batchArray.push(msg.body);
    }
  );

  Consumer.on("error", (err) => console.error(err));

  Consumer.on("ready", () =>
    console.log("Korapay Consumer successfully created")
  );
};

export const initKora_W_Batch_Consumer = () => {
  const BatchConsumer = RabbitMQ.createConsumer(
    {
      queue: "withdrawals.korapay.batches",
      queueOptions: { durable: true },
      qos: { prefetchCount: 2 },
      exchanges: [{ exchange: "koraWithdrawalRequestsBatches", type: "topic" }],
      queueBindings: [
        {
          exchange: "koraWithdrawalRequestsBatches",
          routingKey: "withdrawals.korapay.batches",
        },
      ],
    },
    async (requestsBatch) => {
      try {
        let batch_reference = randomUUID();
        const koraBatchData = {
          batch_reference: batch_reference,
          description: "korapay bulk withdrawal",
          //merchant_bears_cost: false,
          currency: "NGN",
          payouts: requestsBatch.body,
        };

        const axiosConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: bulkWithdrawalUrl,
          headers: {
            Authorization: `Bearer ${koraSecret}`,
          },
          data: koraBatchData,
        };

        const response = await axios(axiosConfig);

        console.log(response.data);
      } catch (err) {
        console.error(err);
      }
    }
  );
};
