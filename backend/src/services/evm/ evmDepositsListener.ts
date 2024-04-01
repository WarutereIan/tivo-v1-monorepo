import {
  Contract,
  WebSocketProvider,
  formatEther,
  formatUnits,
  
} from "ethers";
import { chainConfigs } from "../../config/blockchainConfigs";
import { abiERC20 } from "@metamask/metamask-eth-abis";
import { CryptoWallet } from "../../models/CryptoWallet";
import { TokenBalance } from "../../models/CryptoTokenBalance";
import { Publisher } from "../../config/rabbitmq/publishers";

export const listenForEvmDeposits = async (
  chainName: string,
  token: string
) => {
  try {
    //initially for mumbai
    const chainParams = chainConfigs[chainName];

    let tokenAddress = chainParams.TOKEN_ADDRESSES[token];

    let wssProvider = new WebSocketProvider(chainParams.WSS_RPC_URL);

    const contract = new Contract(tokenAddress, abiERC20, wssProvider);

    //const contractName = await contract.name();
    const contractName = token;
    const contractSymbol = await contract.symbol();
    const contractDecimals = await contract.decimals();

    //will have these regularly uodated in cache: list of wallets needs to be regulary updated
    //to accommodate newly created wallets:
    const evmWallets = await CryptoWallet.find().select("wallet_address");

    const addressesArray: any = [];

    for (const wallet of evmWallets) {
      if (wallet.wallet_address) {
        addressesArray.push(wallet.wallet_address);
      }
    }

    console.log(addressesArray);

    //filter format: Transfer(from, to, amount, )
    const filter = contract.filters.Transfer(null, addressesArray, null);

    //setup evm contract listener

    console.log(
      "set up evm contract listener for chain",
      chainName,
      "and token",
      token
    );

    contract.on(filter, async (event) => {
      //console.log(event);

      const eventDetails = {
        chainName,
        token,
        //need to convert it to show the respective number of decimal places
        amount: Number(formatUnits(event.log.args[2], contractDecimals)),
        wallet_address: event.log.args[1],
        transaction_hash: event.log.transactionHash,
      };

      //will push event to queue, and have a number of workers consume and process the event
      //that is, every process below will be handled by a worker
      //will need means to identify the token name

      //push the event as an object with the contract details as derived below, and the event details
      await Publisher.send(
        { exchange: "EVMDepositEvents", routingKey: "EVMDepositEvents" },

        eventDetails
      );
    });
  } catch (error) {
    console.error(error, "for chain", chainName);
  }
};
