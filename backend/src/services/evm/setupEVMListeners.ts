import { chainList, tokensList } from "../../config/blockchainConfigs";
import { listenForEvmDeposits } from "./ evmDepositsListener";

export const setupEVMListeners = async () => {
  try {
    for (const chain of chainList) {
      for (const token of tokensList) {
        await listenForEvmDeposits(chain, token);
      }
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
