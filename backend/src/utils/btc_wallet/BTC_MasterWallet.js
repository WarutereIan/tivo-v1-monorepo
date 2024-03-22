const axios = require("axios");

const bitcore = require("bitcore-lib");

const privateKey = new bitcore.PrivateKey(
  "KwKhQWAZqVJh5R3josBtt4MsaXGTMPjckMug36s1nqHGXRyFsPNZ"
);
console.log(privateKey.toWIF());

//private key = KwKhQWAZqVJh5R3josBtt4MsaXGTMPjckMug36s1nqHGXRyFsPNZ

const publicKey = privateKey.toPublicKey();

const address = new bitcore.Address(publicKey, bitcore.Networks.testnet);

console.log(address.toString()); //address: mtvynPEKgRxR2NtzYJc8rWmYT4y7LQ6pYr

//get utxos
const testnetURL = "https://blockstream.info/testnet/api";

axios.get(`${testnetURL}/address/${address}/utxo`).then((response) => {
  console.log(response.data);
});
