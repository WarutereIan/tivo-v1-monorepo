import {
  Contract,
  HDNodeWallet,
  JsonRpcProvider,
  Wallet,
  formatEther,
  parseEther,
} from "ethers";
import { config } from "../../config/config";
import { Password } from "../../helpers/password";
import { CryptoWallet } from "../../models/CryptoWallet";
import { abiERC20 } from "@metamask/metamask-eth-abis";
import { abi } from "../abi/tivoVaultABI";
import { chainConfigs } from "../../config/blockchainConfigs";
import Cryptr from "cryptr";

//provider will be varied as per the required/supported network

const _provider = new JsonRpcProvider(config.RPC_PROVIDERS.POLYGON_MUMBAI);

export const createCryptoWallet = async (ownerID: string) => {
  try {
    const provider = new JsonRpcProvider(config.RPC_PROVIDERS.POLYGON_MUMBAI);

    const _mnemonic = Wallet.createRandom().mnemonic;

    const wallet = HDNodeWallet.fromMnemonic(_mnemonic!);

    wallet.connect(provider);

    //encrypt and store private key

    const cryptr = new Cryptr(config.JWT_SECRET);

    const private_key = cryptr.encrypt(wallet.privateKey);

    const public_key = wallet.publicKey;

    const wallet_address = wallet.address;

    let mnemonic;

    if (wallet.mnemonic) mnemonic = cryptr.encrypt(wallet.mnemonic.phrase);

    const cryptoWallet = await CryptoWallet.create({
      private_key,
      public_key,
      ownerID,
      mnemonic,
      wallet_address,
    });

    console.log("created user wallet", cryptoWallet, "wallet", wallet);
  } catch (err) {
    console.log(err);
  }
};

export const authorizeVaultSpender = async (
  private_key: string,
  chain: string,
  token: string
) => {
  const chainParams = chainConfigs[chain];

  const _provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

  const signer = new Wallet(private_key, _provider);

  const tokenContract = new Contract(
    chainParams.TOKEN_ADDRESSES[token],
    abiERC20,
    signer
  );

  const approveTransaction = await tokenContract.approve(
    chainParams.VAULT_CONTRACT_ADDRESSES[token],
    parseEther("10000000.0")
  );

  const receipt = await approveTransaction.wait();

  console.log("authorized vault for", token, "as spender: receipt \n", receipt);

  return true;
};

export const fetchTokenBalance = async (
  tokenAddress: string,
  userAddress: string,
  provider: any
) => {
  try {
    const _provider = new JsonRpcProvider(config.RPC_PROVIDERS.POLYGON_MUMBAI);
    const tokenContract = new Contract(
      "0xafC9D020d0b67522337058f0fDea057769dd386A",
      abiERC20,
      _provider
    );
    //const tokenContract = new Contract(tokenAddress, abiERC20, provider);
    //const tokenBalance = await tokenContract.balanceOf(userAddress);
    const tokenBalance = await tokenContract.balanceOf(
      "0xf4BEEAa146ddEA7B42F36C8b8cdFd57cc2BbD5Fa"
    );

    console.log("token balance", tokenBalance);
  } catch (err) {
    console.log(err);
  }
};

export const VaultActions = {
  deposit: async (
    userPrivateKey: string,
    amount: string,
    chain: string,
    token: string
  ) => {
    let chainParams = chainConfigs[chain];

    const _provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

    const signer = new Wallet(userPrivateKey, _provider);

    //contract is selected based on chain and token:
    const vaultContract = new Contract(
      chainParams.VAULT_CONTRACT_ADDRESSES[token],
      abi,
      signer
    );

    const depositTransaction = await vaultContract.deposit(
      amount,
      await signer.getAddress()
    );

    const receipt = await depositTransaction.wait();

    const balance: string = await vaultContract.balanceOf(
      await signer.getAddress()
    );

    console.log("deposit transaction", depositTransaction);

    console.log("deposit receipt", receipt);

    console.log("balance after deposit", formatEther(balance));

    return Number(formatEther(balance));
  },
  redeem: async (
    userID: string,
    private_key: string,
    amount: string,
    recepient_address: string,
    chain: string,
    token: string
  ) => {
    let chainParams = chainConfigs[chain];

    const _provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

    const signer = new Wallet(private_key, _provider);

    const vaultContract = new Contract(
      chainParams.VAULT_CONTRACT_ADDRESSES[token],
      abi,
      signer
    );

    const redeemUnsigned = await vaultContract.redeem(
      parseEther(amount),
      recepient_address,
      await signer.getAddress()
    );

    const receipt = await redeemUnsigned.wait();

    const balance = await vaultContract.balanceOf(await signer.getAddress());

    console.log("redeem receipt", receipt);

    console.log("balance after redeem", formatEther(balance));

    return Number(formatEther(balance));
  },
  getTotalAssets: async () => {},
};
