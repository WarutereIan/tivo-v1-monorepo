/**
     * @dev req.body format:
     * {
  eventData: {
    product: { reference: '6502c332c8dd14c5a542db9b', type: 'WEB_SDK' },
    transactionReference: 'MNFY|00|20230914092420|000212',
    paymentReference: '6502c332c8dd14c5a542db9b',
    paidOn: '2023-09-14 09:25:10.98',
    paymentDescription: 'Tivobet test payment for monnify',
    metaData: {},
    paymentSourceInformation: [],
    destinationAccountInformation: {
      bankCode: '035',
      bankName: 'Wema bank',
      accountNumber: '5000393698'
    },
    amountPaid: 40000,
    totalPayable: 40000,
    cardDetails: {
      last4: '1111',
      expMonth: '09',
      maskedPan: '411111******1111',
      expYear: '23',
      bin: '411111',
      reusable: false
    },
    paymentMethod: 'CARD',
    currency: 'NGN',
    settlementAmount: '39990.00',
    paymentStatus: 'PAID',
    customer: { name: 'user03', email: 'test3@gmail.com' }
  },
  eventType: 'SUCCESSFUL_TRANSACTION'
}
     */

import { RabbitMQ } from "../../../config/rabbitmq/rabbitmq";
import { Deposit } from "../../../models/Deposit";
import { Wallet } from "../../../models/Wallet";

//create consumer for the queue
export const processMonnifyDepoResponses = () => {
  const Consumer = RabbitMQ.createConsumer(
    {
      queue: "monnifyDepositsResponses",
      queueOptions: { durable: true },
      qos: { prefetchCount: 2 },
      exchanges: [{ exchange: "monnifyDepositsResponses", type: "topic" }],
      queueBindings: [
        {
          exchange: "monnifyDepositsResponses",
          routingKey: "monnifyDepositsResponses",
        },
      ],
    },
    async (msg: any) => {
      try {
        //if successful credit user account
        if (
          msg.body.eventType == "SUCCESSFUL_TRANSACTION" &&
          msg.body.eventData.paymentStatus == "PAID"
        ) {
          const deposit = await Deposit.findById(
            msg.body.eventData.paymentReference
          );

          const userId = deposit?.userId;
          //update wallet
          const wallet = await Wallet.findOne({ ownerID: userId });

          if (wallet && deposit) {
            wallet.currentBalance += Number(
              msg.body.eventData.settlementAmount
            );

            await wallet.save();
            console.info(
              `Deposit successful: user: ${userId}, amount: ${msg.body.eventData.settlementAmount}, gateway: monnify`
            );

            deposit.processed = true;
            deposit.processingStatus = "Completed";
            deposit.depositedInWallet = true;

            await deposit.save();
          }
        }
        //could generate a notification for successful deposits
      } catch (err) {
        console.error(err);
      }
      const sampleResponse = {
        eventData: {
          product: { reference: "6502c332c8dd14c5a542db9b", type: "WEB_SDK" },
          transactionReference: "MNFY|00|20230914092420|000212",
          paymentReference: "6502c332c8dd14c5a542db9b",
          paidOn: "2023-09-14 09:25:10.98",
          paymentDescription: "Tivobet test payment for monnify",
          metaData: {},
          paymentSourceInformation: [],
          destinationAccountInformation: {
            bankCode: "035",
            bankName: "Wema bank",
            accountNumber: "5000393698",
          },
          amountPaid: 40000,
          totalPayable: 40000,
          cardDetails: {
            last4: "1111",
            expMonth: "09",
            maskedPan: "411111******1111",
            expYear: "23",
            bin: "411111",
            reusable: false,
          },
          paymentMethod: "CARD",
          currency: "NGN",
          settlementAmount: "39990.00",
          paymentStatus: "PAID",
          customer: { name: "user03", email: "test3@gmail.com" },
        },
        eventType: "SUCCESSFUL_TRANSACTION",
      };
    }
  );

  Consumer.on("ready", () => {
    console.info("processMonnifyDepoResponses consumer ready");
  });
};
