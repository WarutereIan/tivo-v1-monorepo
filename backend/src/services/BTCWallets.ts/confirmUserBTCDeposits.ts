//checks the user generated txids on the vaults sides, and gets their confirmation status. if txid is confirmed
//the user available_balance is updated

import axios from "axios";
import { BTC_Config } from "../../config/blockchainConfigs";
import { UserUTXO } from "../../models/UserUTXO";
import { UserTXID } from "../../models/UserTXID";
import { BTCWallet } from "../../models/BTCWallet";

export const confirmUserBTCDeposits = async () => {
  try {
    //get the utxos for the vault address
    const utxoCheck = await axios.get(
      `${BTC_Config.TESTNET_URL_ENDPOINT}/address/${BTC_Config.TIVO_VAULT_WALLET_ADDRESS}/utxo`
    );

    const utxos = utxoCheck.data;

    if (utxos.length > 0) {
      for (const utxo of utxos) {
        //check whether transaction is confirmed
        if (utxo.status.confirmed) {
          //get the transaction id, and its associated userTXID document in the db
          const txid = utxo.txid;

          //should find utxois not deposited to user wallet and match those to confirmed utxos in the utxo array
          //only those shall then be processed for crediting
          const userTXIDDoc = await UserTXID.findOne({ txid: txid });
          if (userTXIDDoc && !userTXIDDoc.deposited_to_user_wallet) {
            //get user wallet address that created the txid
            const userBTCWallet = await BTCWallet.findOne({
              walletAddress: userTXIDDoc.walletAddress,
            });
            if (!userBTCWallet)
              return console.log(`USER BTC WALLET for TXID ${txid} NOT FOUND`);
            //credit the amount to the user wallet
            userBTCWallet.unconfirmed_deposit -= userTXIDDoc.amount;
            //credit what got to the wallet after gas deductions
            userBTCWallet.available_balance += utxo.value;
            userTXIDDoc.confirmed = true;
            userTXIDDoc.deposited_to_user_wallet = true;

            await userBTCWallet.save();
            await userTXIDDoc.save();

            console.log(
              `UTXO ${utxo.txid} SUCCESSFULLY PROCESSED and CREDITED to USER BTC WALLET ${userBTCWallet._id} for AMOUNT${utxo.value}`
            );
          } else {
            console.log(
              `UTXO ${utxo.txid} CORRESPONDING DOCUMENT NOT FOUND OR ALREADY PROCESSED`
            );
          }
        } else {
          console.log(`UTXO ${utxo.txid} has STATUS NOT CONFIRMED`);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};
