import axios from "axios";

import bitcore from "bitcore-lib";

const privateKey = new bitcore.PrivateKey("");
console.log(privateKey.toWIF());

//private key =

const publicKey = privateKey.toPublicKey();

const address = new bitcore.Address(publicKey, bitcore.Networks.testnet);

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
