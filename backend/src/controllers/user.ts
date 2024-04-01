import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { CryptoWallet } from "../models/CryptoWallet";
import {
  Contract,
  JsonRpcProvider,
  WebSocketProvider,
  ethers,
  zeroPadValue,
} from "ethers";
import { chainConfigs } from "../config/blockchainConfigs";

import { abiERC20 } from "@metamask/metamask-eth-abis";
import {
  VaultActions,
  authorizeVaultSpender,
  createCryptoWallet,
  erc20Actions,
} from "../utils/ethers/EVM_Wallet";
import Cryptr from "cryptr";
import { config } from "../config/config";
import { TokenBalance } from "../models/CryptoTokenBalance";
import { BTCWallet } from "../models/BTCWallet";
import { createBTCWallet, withdrawBTC } from "../utils/btc_wallet/BTC_Wallet";

export const depositCrypto = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  let userId = req.user.id;

  let { amount, chain, token } = req.body;

  try {
    let userCryptoWallet = await CryptoWallet.findOne({ ownerID: userId });

    const cryptr = new Cryptr(config.JWT_SECRET);

    if (!userCryptoWallet) {
      return res
        .status(404)
        .json({ success: false, msg: "User crypto wallet not found" });
    } else {
      const wallet_address = userCryptoWallet.wallet_address;
      const private_key = cryptr.decrypt(userCryptoWallet.private_key);

      const chainParams = chainConfigs[chain];

      let tokenAddress = chainParams.TOKEN_ADDRESSES[token];

      let wssProvider = new WebSocketProvider(chainParams.WSS_RPC_URL);

      const contract = new Contract(tokenAddress, abiERC20, wssProvider);

      const filter = contract.filters.Transfer(null, wallet_address, null);

      contract.on(filter, async (event) => {
        console.log(`\n`, event.log.args[2]);

        const amount = event.log.args[2];

        //add means to check for tx or block confirmations: checks for 5 confirmations
        await wssProvider.waitForTransaction(event.log.transactionHash, 5);

        console.log("transactions confirmed");

        contract.removeAllListeners();

        //authorize vault smart contract to spend on your behalf
        //should be done on wallet creation, for all supported tokens
        await authorizeVaultSpender(private_key, chain, token);

        //after blocks confirmed user tokens sent to respective vault
        const deposited_amount = await VaultActions.deposit(
          private_key,
          amount,
          chain,
          token
        );

        //update deposited amount in token balance record
        let tokenBalance = await TokenBalance.findOne({
          ownerID: userId,
          tokenName: token,
          chain: chain,
        });
        if (!tokenBalance) {
          await TokenBalance.create({
            ownerID: userId,
            tokenAddress: chainParams.TOKEN_ADDRESSES[token],
            tokenName: token,
            chain: chain,
            balance: deposited_amount,
          });
        } else {
          tokenBalance.balance = Number(deposited_amount);
          await tokenBalance.save();
        }

        return res
          .status(200)
          .json({ success: true, msg: "Deposit completed successfully" });
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

export const getBTCWalletAddress = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  let userID = req.user.id;
  try {
    let userBTCWallet = await BTCWallet.findOne({ userID: userID }).select(
      "walletAddress"
    );

    if (userBTCWallet) {
      return res
        .status(200)
        .json({ success: true, walletAddress: userBTCWallet.walletAddress });
    } else {
      let wallet = await createBTCWallet(userID);

      return res
        .status(200)
        .json({ success: true, walletAddress: wallet?.walletAddress });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: " Internal Server Error" });
  }
};

export const getBTCWalletBalance = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  let userID = req.user.id;
  try {
    let userBTCWallet = await BTCWallet.findOne({ userID: userID }).select(
      "walletAddress available_balance unconfirmed_deposit dust_amount"
    );
    if (userBTCWallet) {
      return res.status(200).json({
        success: true,
        walletAddress: userBTCWallet.walletAddress,
        available_balance: userBTCWallet.available_balance,
        unconfirmed_deposit: userBTCWallet.unconfirmed_deposit,
        dust_amount: userBTCWallet.dust_amount,
      });
    } else
      return res
        .status(404)
        .json({ success: false, msg: "User BTC wallet not found" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

export const withdrawBTCController = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  try {
    let userID = req.user.id;
    let { targetAddress, amount } = req.body;

    //check whether user has enough funds in their btc wallet
    let userBTCWallet = await BTCWallet.findOne({ userID: userID }).select(
      "available_balance"
    );

    if (!userBTCWallet)
      return res
        .status(404)
        .json({ success: false, msg: "User BTC Wallet not found" });

    if (userBTCWallet.available_balance < Number(amount))
      return res.status(418).json({
        success: false,
        msg: "You have insufficient funds in your wallet for the requested amount",
        availableBalance: userBTCWallet.available_balance,
      });

    const result = await withdrawBTC(targetAddress, userID);

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

export const getWalletAddress = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  try {
    let userId = req.user.id;

    let userCryptoWallet = await CryptoWallet.findOne({
      ownerID: userId,
    }).select("wallet_address");

    if (userCryptoWallet) {
      return res.status(200).json({ success: true, userCryptoWallet });
    } else {
      //wallet now created on demand because of gas fees being deposited for every new wallet

      let userCryptoWallet = await createCryptoWallet(userId);

      return res.status(200).json({
        success: true,
        wallet_address: userCryptoWallet?.wallet_address,
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "Could not fetch wallet address" });
  }
};

export const getCryptoWalletBalance = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  let userId = req.user.id;

  try {
    let tokenBalances = await TokenBalance.find({ ownerID: userId }).select(
      "tokenAddress tokenName balance chain"
    );

    if (tokenBalances)
      return res.status(200).json({ success: true, tokenBalances });

    return res
      .status(400)
      .json({ success: false, msg: "User Wallet not found" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

export const withdrawToken = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  let userID = req.user.id;
  let { amount, recepient_address, chain, token } = req.body;

  try {
    let userCryptoWallet = await CryptoWallet.findOne({ ownerID: userID });

    if (!userCryptoWallet)
      return res
        .status(404)
        .json({ success: false, msg: "User Wallet not found" });

    let userTokenBalance = await TokenBalance.findOne({
      ownerID: userID,
      tokenName: token,
      chain: chain,
    });

    if (!userTokenBalance)
      return res.status(404).json({
        success: false,
        msg: "No user balances available for redemption",
      });

    if (userTokenBalance.balance < Number(amount))
      return res.status(400).json({
        success: false,
        msg: "User balance is less than requested token amount",
        balance: userTokenBalance.balance,
      });

    const cryptr = new Cryptr(config.JWT_SECRET);

    const wallet_address = userCryptoWallet.wallet_address;

    userTokenBalance.balance -= amount;

    //save this info to db
    console.log(
      "INITIATED WITHDRAWAL for USER'S TOKEN BALANCE",
      userTokenBalance.id,
      "FOR TOKEN,",
      token,
      "CHAIN",
      chain,
      "AMOUNT",
      amount
    );

    let receipt = await erc20Actions.withdrawFromVaultWallet(
      chain,
      token,
      recepient_address,
      Number(amount)
    );

    await userTokenBalance.save();

    return res.status(200).json({
      success: true,
      msg: `Successfully withdrawn ${amount} ${token} to receiving wallet ${recepient_address}`,
      receipt,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
