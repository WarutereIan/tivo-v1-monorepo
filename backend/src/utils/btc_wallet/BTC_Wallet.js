//import axios from "axios";
const axios = require("axios");
/* import {
  Address,
  Networks,
  PrivateKey,
  PublicKey,
  Script,
  Transaction,
  Unit,
} from "bitcore-lib"; */

const bitcore = require("bitcore-lib");

//generate a private key
//const privateKey = new PrivateKey();

//create a private key instance from an existing private key
const privateKey = new bitcore.PrivateKey(
  "L15nHLcn3bm2Tfkn5Edt5DNKBvHX68LoSVzvhRzc2fFMDRa1DEAy"
);
//exports the private key in WIF format. This we save
console.log("private key", privateKey.toWIF());

//private key we are using for our testing: L15nHLcn3bm2Tfkn5Edt5DNKBvHX68LoSVzvhRzc2fFMDRa1DEAy
//associated address: **n3ybkB2yVQNHT69gymgr8ABcQS4QX9VstU**

//generate a public key from the private key
const publicKey = privateKey.toPublicKey();

//this seems to be the accepted address format & generator
const address = new bitcore.Address(publicKey, bitcore.Networks.testnet);
console.log("address", address.toString());

//get utxos
//Testnet url:https://blockstream.info/testnet/api/. The API is here: https://github.com/Blockstream/esplora/blob/master/API.md
const testnetURL = "https://blockstream.info/testnet/api";

let utxos = [];

const script = bitcore.Script.buildPublicKeyHashOut(address).toString();

console.log("p2pk script", script);

axios.get(`${testnetURL}/address/${address}/utxo`).then((response) => {
  utxos = response.data;

  for (const utxo of utxos) {
    utxo.script = script;
    utxo.satoshis = utxo.value;
  }
  console.log(response.data);

  const amount = bitcore.Unit.fromBTC(0.000001).toSatoshis();
  console.log(amount);

  //create a transaction
  const transaction = new bitcore.Transaction()
    .from(utxos) //feed information about unspent outputs
    .to("mtvynPEKgRxR2NtzYJc8rWmYT4y7LQ6pYr", amount) //address of the recipient,amount to send in satoshis (8 decimal points)
    .change("n3ybkB2yVQNHT69gymgr8ABcQS4QX9VstU") //set upp a change address where the rest of the funds go, in this case same wallet as owner
    .sign(privateKey); //sign the transaction using the private key

  console.log("transaction", transaction.toString());

  const txHex = transaction.toString();

  //broadcast a raw hex transaction to the network
  axios.post(`${testnetURL}/tx`, txHex).then((response) => {
    console.log("This is the transaction hash", response.data);
    //returns the transaction hash, can be stored in db to monitor statuses
    return response.data;
  });
});

/* //parse amount in raw satoshis
const amount = Unit.fromBTC(0.0000001).toSatoshis();

//create a transaction
const transaction = new Transaction()
  .from(utxos) //feed information about unspent outputs
  .to("mzbGvMxen7ZG9yVWiSByghYC1RJn721cd3", amount) //address of the recipient,amount to send in satoshis (8 decimal points)
  .change("n3ybkB2yVQNHT69gymgr8ABcQS4QX9VstU") //set upp a change address where the rest of the funds go, in this case same wallet as owner
  .sign(privateKey); //sign the transaction using the private key

console.log("transaction", transaction.toString());

const txHex = transaction.toString();

//broadcast a raw hex transaction to the network
axios.post(`${testnetURL}/tx`, txHex).then((response) => {
  console.log("This is the transaction hash", response.data);
}); */
