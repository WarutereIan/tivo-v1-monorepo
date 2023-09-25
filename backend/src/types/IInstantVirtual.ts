import { Results } from "./IMatch";

export interface IInstantVirtual {
  prediction: string;
  userID: string;
  results: Results;
  amountStaked: number;
  homeTeam: string;
  awayTeam: string;
  played: boolean;
  won: boolean;
}
