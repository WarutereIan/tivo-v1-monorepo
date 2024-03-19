import "dotenv/config";
import { JsonRpcProvider, Wallet } from "ethers";

export const chainConfigs: {
  [index: string]: {
    JSON_RPC_URL: string;
    WSS_RPC_URL: string;
    TOKEN_ADDRESSES: { [index: string]: string };
    VAULT_CONTRACT_ADDRESSES: { [index: string]: string };
  };
} = {
  MUMBAI: {
    JSON_RPC_URL: process.env.MUMBAI_JSON_RPC_PROVIDER!,
    WSS_RPC_URL: process.env.MUMBAI_JSON_WSS_PROVIDER!,
    TOKEN_ADDRESSES: {
      TIVO: "0x33c510E05C37DD2DAa05504A69FCd45e63343F61",
    },
    VAULT_CONTRACT_ADDRESSES: {
      TIVO: "0xAf40032204fFf88f3896b98eB13f3f98691a0DB8",
    },
  },
};

export const MASTER_WALLET_PRIVATE_KEY: string =
  process.env.MASTER_WALLET_PRIVATE_KEY!;
