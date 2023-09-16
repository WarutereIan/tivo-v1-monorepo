import { RabbitMQ } from "../../../config/rabbitmq/rabbitmq";
import { Wallet } from "../../../models/Wallet";
import { Withdrawal } from "../../../models/Withdrawal";

export const initMonnifyWithdrawalResponseConsumer = () => {
  const Consumer = RabbitMQ.createConsumer(
    {
      queue: "monnifyWithdrawalsResponses",
      queueOptions: { durable: true },
      qos: { prefetchCount: 2 },
      exchanges: [{ exchange: "monnifyWithdrawalsResponses", type: "topic" }],
      queueBindings: [
        {
          exchange: "monnifyWithdrawalsResponses",
          routingKey: "monnifyWithdrawalsResponses",
        },
      ],
    },
    async (msg: any) => {
      try {
        let response = msg.body;
        let withdrawalId = response.eventData.reference;
        let withdrawnAmount = Number(response.eventData.amount);
        let fee = Number(response.eventData.fee);

        switch (response.eventType) {
          case "FAILED_DISBURSEMENT":
            {
              let withdrawalRequest = await Withdrawal.findById(withdrawalId);
              if (withdrawalRequest) {
                withdrawalRequest.processed = true;
                withdrawalRequest.processingStatus = response.eventData.status;
                withdrawalRequest.paidOut = false;
                withdrawalRequest.msg =
                  response.eventData.transactionDescription;

                await withdrawalRequest.save();
                console.log(
                  `Updated Withdrawal Request: ${withdrawalRequest.id}, Status: ${withdrawalRequest.processingStatus}`
                );
              }
            }
            break;

          case "SUCCESSFUL_DISBURSEMENT":
            {
              let withdrawalRequest = await Withdrawal.findById(withdrawalId);
              if (withdrawalRequest) {
                withdrawalRequest.processed = true;
                withdrawalRequest.processingStatus = response.eventData.status;
                withdrawalRequest.paidOut = true;
                withdrawalRequest.msg =
                  response.eventData.transactionDescription;

                await withdrawalRequest.save();
                console.log(
                  `Updated Withdrawal Request: ${withdrawalRequest.id}, Status: ${withdrawalRequest.processingStatus}`
                );

                let userId = withdrawalRequest.userId;

                let userWallet = await Wallet.findOne({ ownerID: userId });
                if (userWallet) {
                  userWallet.currentBalance -= withdrawnAmount + fee; //charge fee on user
                  await userWallet.save();

                  console.log(
                    `Withdrawn from wallet for User: ${userId}, amount: ${withdrawnAmount}, fee: ${fee}`
                  );
                }
              }
            }
            break;
        }
      } catch (err) {
        console.error(err);
      }
    }
  );
};

const msgFormat = {
  eventData: {
    amount: 5895,
    transactionReference: "MFDS92520230915092331000404QUWSVL",
    fee: 35,
    transactionDescription: "Account number could not be validated",
    destinationAccountNumber: "1085386393",
    sessionId: "",
    createdOn: "15/09/2023 9:23:32 AM",
    reference: "65041478517c1b41e71e6e9f",
    destinationBankCode: "058",
    completedOn: "15/09/2023 9:23:32 AM",
    narration: "Tivobet withdrawal",
    currency: "NGN",
    status: "FAILED",
  },
  eventType: "FAILED_DISBURSEMENT",
};

const msgSuccess = {
  eventData: {
    amount: 2796,
    transactionReference: "MFDS25020230915095913000536KHJ1D0",
    fee: 35,
    transactionDescription: "Transaction was successful",
    destinationAccountNumber: "2085886393",
    sessionId: "",
    createdOn: "15/09/2023 9:59:13 AM",
    destinationAccountName: "BENJAMIN CHUKWUEMEKA ONONOGBU",
    reference: "65041b1eea93493bea90b2a3",
    destinationBankCode: "057",
    completedOn: "15/09/2023 9:59:27 AM",
    narration: "Tivobet withdrawal",
    currency: "NGN",
    destinationBankName: "Zenith bank",
    status: "SUCCESS",
  },
  eventType: "SUCCESSFUL_DISBURSEMENT",
};
