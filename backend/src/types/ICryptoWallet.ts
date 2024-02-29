export interface ITokenBalance {
  tokenAddress: string;
  tokenName: string;
  balance: number;
  chain: string
}

export interface ICryptoWallet {
  ownerID: string;
  public_key: string;
  wallet_address: string;
  private_key: string;
  mnemonic: string;
  balances: ITokenBalance[];
}
