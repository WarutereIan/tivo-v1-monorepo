import {
  Contract,
  HDNodeWallet,
  JsonRpcProvider,
  Wallet,
  WebSocketProvider,
  formatEther,
  parseEther,
} from "ethers";
import { config } from "../../config/config";
import { Password } from "../../helpers/password";
import { CryptoWallet } from "../../models/CryptoWallet";
import { abiERC20 } from "@metamask/metamask-eth-abis";
import { abi } from "../abi/tivoVaultABI";
import {
  MASTER_WALLET_PRIVATE_KEY,
  chainConfigs,
} from "../../config/blockchainConfigs";
import Cryptr from "cryptr";

//provider will be varied as per the required/supported network

export const createCryptoWallet = async (
  ownerID: string,
  chain: string = "MUMBAI"
) => {
  try {
    let chainParams = chainConfigs[chain];

    const provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

    const _mnemonic = Wallet.createRandom().mnemonic;

    const wallet = HDNodeWallet.fromMnemonic(_mnemonic!);

    //initialize master wallet
    const masterWallet = new Wallet(MASTER_WALLET_PRIVATE_KEY, provider);

    //transfer the min amount of initial gas fee from master wallet to client wallet
    let seedDepositTx = await masterWallet.sendTransaction({
      to: wallet.address,
      value: parseEther("0.01"),
    });

    let receipt = await seedDepositTx.wait();

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

    return cryptoWallet;
  } catch (err) {
    console.log(err);
  }
};

export const authorizeVaultSpender = async (
  private_key: string,
  chain: string,
  token: string
) => {
  try {
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

    console.log(
      "authorized vault for",
      token,
      "as spender: receipt \n",
      receipt
    );

    return true;
  } catch (err) {
    console.log(err);
  }
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
    try {
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

      return formatEther(balance);
    } catch (err) {
      console.log(err);
    }
  },
  redeem: async (
    userID: string,
    private_key: string,
    amount: string,
    recepient_address: string,
    chain: string,
    token: string
  ) => {
    try {
      let chainParams = chainConfigs[chain];

      const _provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

      const signer = new Wallet(private_key, _provider);

      const vaultContract = new Contract(
        chainParams.VAULT_CONTRACT_ADDRESSES[token],
        abi,
        signer
      );
      //estimate gas price of the redeem function:
      // always check whether it's upto a certain threshold in db first, if not, deposit from master wallet;
      // and only then proceed with widrawal from the vault

      //unrelated: on win, user gets tokens minted as per the size of the win
      //so in db wallet, keep track of the total balance from the deposit
      //and that of winnings as a virtual number also in db
      //upon redeem tally the total amount won, if number is +ve & withdrawal amount surpasses initial balance we mint vTokens, then withdraw by redeeming these tokens
      //NB: total amount won + the default available balance = total user's balance
      //when making a bet we subtract from the available balance in the db wallet and that's it
      const redeemUnsigned = await vaultContract.redeem(
        parseEther(amount),
        recepient_address,
        await signer.getAddress()
      );

      const gasFee = redeemUnsigned;

      const receipt = await redeemUnsigned.wait();

      const balance = await vaultContract.balanceOf(await signer.getAddress());

      console.log("redeem receipt", receipt);

      console.log("balance after redeem", formatEther(balance));

      return formatEther(balance);
    } catch (err) {
      console.log(err);
    }
  },
  getTotalAssets: async () => {},
};
