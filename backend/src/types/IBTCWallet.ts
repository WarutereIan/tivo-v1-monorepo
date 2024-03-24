export interface IBTCWallet {
  userID: string;
  privateKey: string;
  publicKey: string;
  walletAddress: string;
  available_balance: number;
  script: string;
  unconfirmed_deposit: number;
  dust_amount: number;
  privateKey2: string;
  publicKey2: string;
  walletAddress2: string;
  script2: string;
}
