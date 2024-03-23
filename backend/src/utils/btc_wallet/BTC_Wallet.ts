import axios from "axios";
/* import {
  Address,
  Networks,
  PrivateKey,
  PublicKey,
  Script,
  Transaction,
  Unit,
} from "bitcore-lib"; */

import bitcore from "bitcore-lib";
import { BTCWallet } from "../../models/BTCWallet";

//generate a private key
//const privateKey = new PrivateKey();

export const createBTCWallet = async (userID: string) => {
  try {
    //create a private key instance
    const _privateKey = new bitcore.PrivateKey();

    //convert the private key to WIF format
    const privateKey = _privateKey.toWIF();

    //generate a public key from the private key
    const publicKey = _privateKey.toPublicKey();
    //encrypt private key

    //generate an address from the public key: convert this to mainnet before launch
    const address = new bitcore.Address(publicKey, bitcore.Networks.testnet);

    //create script
    const script = bitcore.Script.buildPublicKeyHashOut(address).toString();

    //save these to db
    const userBTCWallet = await BTCWallet.create({
      userID: userID,
      privateKey: privateKey,
      publicKey: publicKey,
      walletAddress: address,
      script: script,
    });

    console.info(`created BTC wallet for user ${userID} \n ${userBTCWallet}`);
    return userBTCWallet;
  } catch (err) {
    console.error(err);
  }
};

export const deposit = async (userID: string) => {
  try {
    //returns user's btc address:
    //so we should listen to user's utxos, add them to db under userUTXO, transfer the sum in these utxo to the main vault wallet in a single tx
    //using these utxos as the transaction inputs. get the tx hash and store in db with values of utxos used as inputs, fees, total transferred
    //we need transaction hashes of the transfer txs to the vault only actually
  } catch (err) {
    console.error(err);
  }
};

export const withdrawBTC = async (targetAddress: string, userID: string) => {
  try {
    //validate the target address to be a valid address
    //check whether amount being withdrawn is less than or greater than allowed amount; if not return with error msg and code
    //check whether user has the required balance in their virtual wallet for this withdrawal; if not return with error msg and code
    //create a user withdrawal document in db, mark it 'unconfirmed', 'unprocessed'
    //batch process withdrawals at set intervals
    //mark document confirmed or processed after successful transfer
    //so will need to keep track of total available in vault, and total amounts won in bets with btc staked,
    //total lost in bets with btc staked
    //total deposits made with btc
    //total withdrawals
  } catch (err) {
    console.error(err);
  }
};

export const getBTCWalletUTXOs = async (walletAddress: string) => {
  try {
  } catch (err) {
    console.error(err);
    return null;
  }
};

//create a private key instance from an existing private key
/* const privateKey = new bitcore.PrivateKey(
"
);
//exports the private key in WIF format. This we save
console.log("private key", privateKey.toWIF()); */

//private key we are using for our testing
//associated address: **mtoxkMiHRPa7dWPsPsJNr7ctYeBvVs8qXU**

//generate a public key from the private key
/* const publicKey = privateKey.toPublicKey();

//this seems to be the accepted address format & generator
const address = new bitcore.Address(publicKey, bitcore.Networks.testnet);
console.log("address", address.toString());

//get utxos
//Testnet url:https://blockstream.info/testnet/api/. The API is here: https://github.com/Blockstream/esplora/blob/master/API.md
const testnetURL = "https://blockstream.info/testnet/api";

let utxos = [];

const script = bitcore.Script.buildPublicKeyHashOut(address).toString();

console.log("p2pk script", script);

try {
  //from utxos do we combine to get the total balances
  axios.get(`${testnetURL}/address/${address}/utxo`).then((response: any) => {
    utxos = response.data;
    let availableBal = 0;

    for (const utxo of utxos) {
      utxo.script = script;
      utxo.satoshis = utxo.value;

      //keep track of this in db
      availableBal += utxo.value;
    }
    console.log(response.data);

    console.log(
      "available balance in BTC",
      bitcore.Unit.fromSatoshis(availableBal).toBTC()
    );

    const amount = bitcore.Unit.fromBTC(0.000001).toSatoshis();
    console.log(amount);

    //create a transaction
    const transaction = new bitcore.Transaction()
      .from(utxos) //feed information about unspent outputs
      .to("mu7FUGYdZ5kHXPgzK9ZvjHRd47LS4i4TYK", availableBal) //address of the recipient,amount to send in satoshis (8 decimal points)
      .change(address) //set upp a change address where the rest of the funds go, in this case same wallet as owner
      .sign(privateKey) //sign the transaction using the private key
      .fee(5430); //minimum non dust amount
    console.log("transaction", transaction.toString());

    console.log("transaction fee estimate", transaction.getFee());

    //update transaction to subtract fee estimate from amount transferred

    //store tx hash in db? Yeah..so that we can compare utxos in master wallet and their respective
    //sender addresses, then based on how much is received from the utxo we update the users btc balance
    //in the virtual wallet. Then we mark the transaction hash as confirmed/processed/added to user's balance in the txhash db

    //

    const txHex = transaction.toString();

    //broadcast a raw hex transaction to the network. Here we should be sending any available balances
    //to the main wallet/vault when
    axios.post(`${testnetURL}/tx`, txHex).then((response: any) => {
      console.log("This is the transaction hash", response.data);
      //returns the transaction hash, can be stored in db to monitor statuses
      return response.data;
    });
  });
} catch (err: any) {
  console.error(err.data);
}
 */
