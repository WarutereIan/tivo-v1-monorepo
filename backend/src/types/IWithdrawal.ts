interface IWithdrawal {
  paymentGateway: string;
  userId: string;
  amount: number;
  processed: boolean;
  processingStatus: string;
  paidOut: boolean;
  time: any;
  msg: string;
}
