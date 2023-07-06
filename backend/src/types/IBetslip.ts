export type gamePick = {
  match_id: string;
  predicted_winner: string; //settle whether string, or array indicative of picks, or object. String provides easiest computation 4 comparison
  odds: number;
  won: boolean;
  processed: boolean;
};

export interface IBetslip {
  userID: string;
  games: gamePick[];
  total_odds: number;
  processing_completed: boolean;
  won: boolean;
  amount_staked: number;
  potential_winnings: number;
  paid_out: boolean;
}
