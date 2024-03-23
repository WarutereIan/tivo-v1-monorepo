//periodically check for utxos from user wallets
//employ a mechanism or algorithm to know which wallets to check for; e.g user clicks deposit/top up btc wallet, we watch that wallet address
//deposits need to reflect irt

import axios from "axios";
import bitcore, { Address, Networks, PrivateKey } from "bitcore-lib";
import { BTCWallet } from "../../models/BTCWallet";
import { BTC_Config } from "../../config/blockchainConfigs";
import { UserTXID } from "../../models/UserTXID";
import { Transaction } from "ethers";

export const checkUserBTCDeposits = async () => {
  try {
    const BTCwallets = await BTCWallet.find();

    if (BTCwallets) {
      for (const BTCWallet of BTCwallets) {
        //get wallet utxos
        let utxos = [];

        const response = await axios.get(
          `${BTC_Config.TESTNET_URL_ENDPOINT}/address/${BTCWallet.walletAddress}/utxo`
        );

        utxos = response.data;

        if (utxos.length > 0) {
          let availableBal = 0;
          const privateKey = new PrivateKey(BTCWallet.privateKey);
          const publicKey = privateKey.toPublicKey();
          const address = new Address(publicKey, Networks.testnet);

          const script =
            bitcore.Script.buildPublicKeyHashOut(address).toString();

          for (const utxo of utxos) {
            utxo.script = script;
            utxo.satoshis = utxo.value;

            //keep track of this in db as unconfirmed unspent amount
            //balance is in satoshis
            availableBal += utxo.value;
          }
          availableBal -= 3 * BTC_Config.MINIMUM_NON_DUST_FEE;

          //have a minimum amount in utxos that is transferrable: 2 * minimum nondust fee
          //to go ahead with the transaction, available bal will have to be greater than 2*minimum nondust fee
          if (availableBal > 2 * BTC_Config.MINIMUM_NON_DUST_FEE) {
            //create tx to deposit all of the available utxo into the vault wallet
            const transaction = new bitcore.Transaction()
              .from(utxos)
              .to(BTC_Config.TIVO_VAULT_WALLET_ADDRESS, availableBal)
              .change(address)
              .sign(privateKey);
            //.fee(10000); //will need to check minimum nondust fee

            //convert to raw hex representation
            const txHex = transaction.toString();

            //will need mechanism to calculate fee based on the transaction size; size is txHex/2 bytes,
            //fee will be size * price of satoshi/byte
            console.log(transaction);

            //store raw hex transaction in db

            //broadcast raw hex transaction
            let response = await axios.post(
              `${BTC_Config.TESTNET_URL_ENDPOINT}/tx`,
              txHex
            );

            //response will be the txid, store the txid in the db.
            await UserTXID.create({
              txid: response.data,
              walletAddress: BTCWallet.walletAddress,
              amount: availableBal,
            });

            BTCWallet.unconfirmed_deposit += availableBal;
            await BTCWallet.save();
            console.log(
              `updated BTCWallet ${BTCWallet.walletAddress} unconfirmed deposit as ${BTCWallet.unconfirmed_deposit}`
            );
          }
          //if not spendable store the balance as a dust amount in the db
          else {
            BTCWallet.dust_amount += availableBal;
            await BTCWallet.save();
            console.log(
              `updated BTCWallet ${BTCWallet.walletAddress} unconfirmed dust amount as ${BTCWallet.dust_amount}`
            );
          }
        }

        console.log("no utxos found for the wallet", BTCWallet.walletAddress);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
