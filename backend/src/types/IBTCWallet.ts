export interface IBTCWallet {
  userID: string;
  privateKey: string;
  publicKey: string;
  walletAddress: string;
  available_balance: number;
  script: string;
  unconfirmed_deposit: number;
  dust_amount: number;
}
