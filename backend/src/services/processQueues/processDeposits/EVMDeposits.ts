import { WebSocketProvider } from "ethers";
import { chainConfigs } from "../../../config/blockchainConfigs";
import { RabbitMQ } from "../../../config/rabbitmq/rabbitmq";
import { CryptoWallet } from "../../../models/CryptoWallet";
import { TokenBalance } from "../../../models/CryptoTokenBalance";
import { erc20Actions } from "../../../utils/ethers/EVM_Wallet";
import Cryptr from "cryptr";
import { config } from "../../../config/config";
//import { MatchGoalDistributionManagers } from "../../calculateGoalsOdds"

export const processEVMDeposits = () => {
  const Consumer = RabbitMQ.createConsumer(
    {
      queue: "EVMDepositEvents",
      queueOptions: { durable: true },
      qos: { prefetchCount: 2 },
      exchanges: [{ exchange: "EVMDepositEvents", type: "topic" }],
      queueBindings: [
        {
          exchange: "EVMDepositEvents",
          routingKey: "EVMDepositEvents",
        },
      ],
    },
    async (msg: any) => {
      try {
        const { chainName, token, amount, wallet_address, transaction_hash } =
          msg.body;

        //console.log(chainName);

        const chainParams = chainConfigs[chainName];

        console.log("processing EVM TOKEN deposit", msg.body, "\n");

        let wssProvider = new WebSocketProvider(chainParams.WSS_RPC_URL);

        //await for 5 confirmations for the transaction hash
        let receipt = await wssProvider.waitForTransaction(transaction_hash, 5);
        //console.log(receipt);

        const userCryptoWallet = await CryptoWallet.findOne({
          wallet_address: wallet_address,
        });

        if (userCryptoWallet) {
          const cryptr = new Cryptr(config.JWT_SECRET);

          const private_key = cryptr.decrypt(userCryptoWallet.private_key);
          //transfer amount to vault wallet
          let vaultDeposit = await erc20Actions.transferToVaultWallet(
            private_key,
            chainName,
            token,
            wssProvider
          );

          //console.log(vaultDeposit);

          //update deposited amount in token balance record
          let tokenBalance = await TokenBalance.findOne({
            ownerID: userCryptoWallet?.ownerID,
            tokenName: token,
            //chain will be set as a param when calling the function
            //so in each chain we will have an array of objects, each of which will be the list of supported tokens on that chain and their respective info
            //thus we will just initialize the evm deposits listeners with one function
            //supported chains will also be an array of chains with format:
            //{chainName: string, config..and list of supported tokens; tokens:{ }}
            chain: chainName,
          });
          if (!tokenBalance) {
            tokenBalance = await TokenBalance.create({
              ownerID: userCryptoWallet?.ownerID,
              tokenAddress: chainParams.TOKEN_ADDRESSES[token],
              tokenName: token,
              chain: chainName,
              balance: amount,
            });
          } else {
            //will need to format based on number of decimals from contract
            tokenBalance.balance += amount;
            await tokenBalance.save();
          }
          console.log(
            "successfully made wallet deposit for token",
            tokenBalance.tokenName,
            "amount",
            amount,
            "wallet ownerID",
            tokenBalance.ownerID
          );
        }
      } catch (error) {}
    }
  );
};
