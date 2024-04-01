import {
  Contract,
  HDNodeWallet,
  JsonRpcProvider,
  Wallet,
  WebSocketProvider,
  formatEther,
  parseEther,
  parseUnits,
} from "ethers";
import { config } from "../../config/config";
import { Password } from "../../helpers/password";
import { CryptoWallet } from "../../models/CryptoWallet";
import { abiERC20 } from "@metamask/metamask-eth-abis";
import { abi } from "../abi/tivoVaultABI";
import {
  MASTER_WALLET_PRIVATE_KEY,
  MASTER_WALLET_PUBLIC_KEY,
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
      value: parseEther("0.0001"),
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

//will need to always authiruze spender for all the supported tokens

//this function will not be in use anymore/for now as erc 4626 vaults will not be employed
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

export const erc20Actions = {
  transferToVaultWallet: async (
    private_key: string,
    chain: string,
    token: string,
    provider: WebSocketProvider
  ) => {
    try {
      const chainParams = chainConfigs[chain];

      //const _provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

      const signer = new Wallet(private_key, provider);

      const tokenContract: any = new Contract(
        chainParams.TOKEN_ADDRESSES[token],
        abiERC20,
        signer
      );

      //estimate gas for the user's transfer

      const feeData = await provider.getFeeData();

      //estimate gas
      const gas = await tokenContract.transfer.estimateGas(
        MASTER_WALLET_PUBLIC_KEY,
        await tokenContract.balanceOf(await signer.getAddress())
      );

      //console.log("gas", gas);
      //get total gas fees
      const totalGasFees = feeData.maxFeePerGas
        ? gas * feeData.maxFeePerGas
        : gas;

      //get user native token balance
      const balance = await provider.getBalance(await signer.getAddress());

      if (balance < totalGasFees) {
        //top up user wallet with gas fees
        const masterWallet = new Wallet(MASTER_WALLET_PRIVATE_KEY, provider);

        //transfer the min amount of initial gas fee from master wallet to client wallet
        let gasTopUpTx = await masterWallet.sendTransaction({
          to: await signer.getAddress(),
          value: totalGasFees,
        });

        let receipt = await gasTopUpTx.wait();

        if (receipt) {
          console.log(
            "TOPPED UP user wallet ",
            await signer.getAddress(),
            "on CHAIN",
            chain,
            "WITH FEES",
            receipt?.gasUsed * receipt?.gasPrice,
            "TXID",
            receipt.hash,
            "\n"
          );
        }
      }

      //transfer all of the user's tokens to vault
      /**
       * transfer(target, amount)
       */
      let receipt = await tokenContract.transfer(
        MASTER_WALLET_PUBLIC_KEY,
        await tokenContract.balanceOf(await signer.getAddress())
      );

      console.log(
        "ERC20 VAULT DEPOSIT made for ADDRESS",
        await signer.getAddress(),
        "on CHAIN",
        chain,
        "TXID",
        receipt.hash,
        "\n"
      );

      return receipt;
    } catch (error) {
      console.error(error);
    }
  },

  withdrawFromVaultWallet: async (
    chain: string,
    token: string,
    destinationAddress: string,
    amount: number
  ) => {
    try {
      const chainParams = chainConfigs[chain];

      const provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

      const signer = new Wallet(MASTER_WALLET_PRIVATE_KEY, provider);

      const tokenContract: any = new Contract(
        chainParams.TOKEN_ADDRESSES[token],
        abiERC20,
        signer
      );

      let receipt = await tokenContract.transfer(
        destinationAddress,
        parseUnits(JSON.stringify(amount), await tokenContract.decimals())
      );

      return receipt;
    } catch (error) {
      console.error(error);
    }
  },
};

export const fetchTokenBalance = async (
  userAddress: string,
  token: string,
  chain: string
) => {
  try {
    const chainParams = chainConfigs[chain];

    const tokenAddress = chainParams.TOKEN_ADDRESSES[token];

    const _provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);
    const tokenContract = new Contract(tokenAddress, abiERC20, _provider);
    //const tokenContract = new Contract(tokenAddress, abiERC20, provider);
    //const tokenBalance = await tokenContract.balanceOf(userAddress);
    const tokenBalance = await tokenContract.balanceOf(userAddress);

    console.log("token balance", tokenBalance);

    return tokenBalance;
  } catch (err) {
    console.log(err);
  }
};

//to place bet with native tokens
//since eoa wallets don't emit events on receiving tx's,
//we'll at first be checking the balance on-chain
//store that in db, and use that in that round of betting; will need to update balance every now and then during active betting sessions
//or make simple smart contract wallet for every user? no, will need to listen to events from all these

export const NativeTokenActions = {
  getWalletBalance: async (chainName: string, wallet_address: string) => {
    try {
      const chainParams = chainConfigs[chainName];

      const _provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

      const _balance = await _provider.getBalance(wallet_address);

      const balance = formatEther(_balance);

      return balance;
    } catch (error) {}
  },
  transferToVaultWallet: async (
    chainName: string,
    sender_private_key: string,
    amount: string
  ) => {
    try {
      const chainParams = chainConfigs[chainName];

      const _provider = new JsonRpcProvider(chainParams.JSON_RPC_URL);

      const signer = new Wallet(sender_private_key, _provider);

      const tx = await signer.sendTransaction({
        to: chainParams.NATIVE_TOKEN_VAULT_ADDRESS,
        value: parseUnits(amount, "ether"),
      });

      const receipt = await tx.wait();

      console.log(receipt);

      return receipt;
    } catch (error) {}
  },
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

  //each vault contract will be initialized with the master wallet having 10 000 000 vtokens minted already
  //when a user needs to withdraw/redeem their shares, and their virtual wallet balance exceeds their shares balance
  //their shares balance is topped up from the master wallet; then they can redeem ; this will incur high gas fees in the long run? Yes

  //or we can just maintain virtual balances, do away with the vaults; deposits get transferred to the master wallet and not the vault,
  //balances are updated virtually in the db after every deposit, stake action, win action and withdrawal action
  //during the withdrawal the user will then only provide their target address for withdrawals and the respective tokens transferred to this address

  //saves on gas as 2 processes are skipped; authorize vault spender, and all the corresponding vault actions.
  //we can then have one wallet address for each token, or all can just be associated with the same address
};
