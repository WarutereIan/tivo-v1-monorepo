import axios from "axios";

import bitcore from "bitcore-lib";

/* const privateKey = new bitcore.PrivateKey(
  
); */
const privateKey = new bitcore.PrivateKey();
console.log(privateKey.toWIF());

//private key =

const publicKey = privateKey.toPublicKey();

const address = new bitcore.Address(publicKey, bitcore.Networks.testnet);
/* const address = new bitcore.Address(
  "myBzjfwoNyq2n7gwJ5xYWAXaNzh6ipzohb",
  bitcore.Networks.testnet
); */

console.log(address.toString()); //address: mu7FUGYdZ5kHXPgzK9ZvjHRd47LS4i4TYK

//get utxos: strategy: place in a while loop so that the functionality is always running...
//get utxos, store in db: check whether created, if not create on master wallet side, with 'confirmed' status initially as false.
//then if utxos has confrmed:true, we can update the confirmed status to true in the db and then credit the user wallet...or credit the user wallet first.
//if created, check whether processed/confirmed, if not and already has status as confirmed, update user virual wallet
// btc balance, and change 'processed' status to true

//we can actually maintain a list of already processed transactions locally to prevent always checking the db: maintain it in the cache, with the txid being
//the actual object id. Then we can Redis.get("txid"), if null, continue processing with db, if exists/true, skip.
//then for each utxo which has been processed and credited we push to the cache.

const testnetURL = "https://blockstream.info/testnet/api";

axios.get(`${testnetURL}/address/${address}/utxo`).then((response) => {
  console.log(response.data);
});
let utxos = [];

const script = bitcore.Script.buildPublicKeyHashOut(address).toString();
//const script = bitcore.Script.buildPublicKeyHashOut().toString();

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
      availableBal -= 1000;
    }
    //console.log(response.data);

    console.log(
      "available balance in BTC",
      bitcore.Unit.fromSatoshis(availableBal).toBTC()
    );

    //create a transaction
    const transaction = new bitcore.Transaction()
      .from(utxos) //feed information about unspent outputs
      .to("mwpSNNNmXXxj4yBmU8ffP1YQWeWzbTCsxp", availableBal) //address of the recipient,amount to send in satoshis (8 decimal points)
      .change("migoAKw49XzFbe26mNrxGCdQ1gEwHkECb7") //set upp a change address where the rest of the funds go, in this case same wallet as owner
      .sign(privateKey); //sign the transaction using the private key
    //.fee(5430); //minimum non dust amount
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
