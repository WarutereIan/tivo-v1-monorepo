export interface ISSBets {
  action_id: string;
  action_type: string;
  amount: number;
  jackpot_contribution: number;
  processed: boolean;
  user_id: string;
  processed_at: any;
  rollback_action_id: string;
  rolled_back: boolean;
  rolled_back_at: any;
}
