interface IDeposit {
  referenceId: string;
  paymentGateway: string;
  userId: string;
  amount: number;
  processed: boolean;
  processingStatus: string;
  depositedInWallet: boolean;
  time: any;
  msg: string;
}
