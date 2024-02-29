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
import { VaultActions, authorizeVaultSpender } from "../utils/ethers/wallet";
import Cryptr from "cryptr";
import { config } from "../config/config";
import { TokenBalance } from "../models/CryptoTokenBalance";

export const createCryptoWallet = async () => {};

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
          tokenBalance.balance = deposited_amount;
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
    }
    return res.status(404).json({
      success: false,
      msg: "Wallet not found, please create wallet to get deposit address",
    });
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
    let tokenBalances = await TokenBalance.find({ ownerID: userId });

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

export const redeemShares = async (req: Request, res: Response) => {
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
      });

    const cryptr = new Cryptr(config.JWT_SECRET);

    const wallet_address = userCryptoWallet.wallet_address;
    const private_key = cryptr.decrypt(userCryptoWallet.private_key);

    const new_balance = await VaultActions.redeem(
      userID,
      private_key,
      amount,
      recepient_address,
      chain,
      token
    );

    userTokenBalance.balance = new_balance;

    await userTokenBalance.save();

    return res
      .status(200)
      .json({
        success: true,
        msg: `Successfully withdrawn ${amount} ${token} to receiving wallet ${recepient_address}`,
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
