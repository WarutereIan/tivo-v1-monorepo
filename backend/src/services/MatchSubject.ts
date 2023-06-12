import { Subject } from "rxjs";
import { MainserviceService } from "./footballMatchSimulator/mainservice.service";
import { MatchsettingsComponent } from "./footballMatchSimulator/matchsettings.module";
import { ScoreboardComponent } from "./footballMatchSimulator/scoreboard.component";
import { StatsComponent } from "./footballMatchSimulator/stats.component";
import fs from "fs";
import { Match } from "../models/Match";
import { Results } from "../types/IMatch";
import { Team } from "../models/Team";
import { updateTeam } from "../helpers/updateTeamStatsAfterMatch";

export class MatchSubject {
  mainService!: MainserviceService;
  matchSettings!: MatchsettingsComponent;
  matchStats!: StatsComponent;
  matchPlay!: ScoreboardComponent;
  matchID!: string;
  homeTeam!: string;
  awayTeam!: string;
  homeTeamGoalsResult!: number;
  awayTeamGoalsResult!: number;
  homeTeamGoalDifference!: number;
  awayTeamGoalDifference!: number;
  matchResults!: Results;
  MatchStats = new Subject<any>();
  MatchStatus!: string;
  matchWinner!: string;
  matchDrawn!: boolean;
  homeTeamPoints!: number;
  awayTeamPoints!: number;

  constructor(matchID: string, homeTeam: string, awayTeam: string) {
    this.matchID = matchID;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.mainService = new MainserviceService(fs);
    this.matchSettings = new MatchsettingsComponent(this.mainService);
    this.matchStats = new StatsComponent(this.mainService);
    this.matchPlay = new ScoreboardComponent(this.mainService);
  }

  startMatch() {
    this.matchSettings.ChangeTournament("UEFA Champions League");

    this.matchSettings.ChangeHomeTeamName(this.homeTeam);

    this.matchSettings.ChangeAwayTeamName(this.awayTeam);

    this.mainService.updateMatchID(this.matchID);

    this.matchSettings.ChangeRelativeStrength(4);

    this.matchSettings.ChangeHomeCrowdSupport(1);

    this.matchSettings.ChangeHomeTeamMorale(2);

    this.matchSettings.ChangeAwayTeamMorale(1);

    this.matchSettings.ChangeHomeTeamTactics(4);

    this.matchSettings.ChangeAwayTeamTactics(1);

    this.matchSettings.proceedToMatch();

    this.matchPlay.startMatch();

    this.matchStats.stats.subscribe((res: any) => {
      this.MatchStats.next([this.matchID, ...res]);
      this.homeTeamGoalsResult = res[res.length - 2];
      this.awayTeamGoalsResult = res[res.length - 1];
    });

    this.matchStats.matchStatus.subscribe(async (res: any) => {
      if (res == "Full time") {
        console.log("match ended", this.matchID);
        this.MatchStats.next("Game Ended");

        console.log("home team goals", this.homeTeamGoalsResult);
        console.log("away team goals", this.awayTeamGoalsResult);

        this.homeTeamGoalDifference =
          this.homeTeamGoalsResult - this.awayTeamGoalsResult;
        this.awayTeamGoalDifference =
          this.awayTeamGoalsResult - this.homeTeamGoalsResult;
        //add functionality to add match results to team; then post them in db

        /**
         * add hooks to calculate gd, total goals and total points, for each result
         * hooks for adding to total games played, wins, losses,
         */
        if (this.homeTeamGoalsResult > this.awayTeamGoalsResult) {
          this.matchWinner = this.homeTeam;
          this.matchDrawn = false;
          this.homeTeamPoints = 3;
          this.awayTeamPoints = 0;
        } else if (this.homeTeamGoalsResult < this.awayTeamGoalsResult) {
          this.matchWinner = this.awayTeam;
          this.matchDrawn = false;
          this.homeTeamPoints = 0;
          this.awayTeamPoints = 3;
        } else {
          this.matchWinner = "none";
          this.matchDrawn = true;
          this.homeTeamPoints = this.awayTeamPoints = 1;
        }

        this.matchResults = {
          homeTeamGoals: this.homeTeamGoalsResult,
          awayTeamGoals: this.awayTeamGoalsResult,
          totalGoals: this.homeTeamGoalsResult + this.awayTeamGoalsResult,
          winner: this.matchWinner,
          draw: this.matchDrawn,
        };

        this.MatchStatus = "Full time";

        await Match.findOneAndUpdate(
          { _id: this.matchID },
          {
            results: this.matchResults,
          }
        );

        //Update home team stats:
        await updateTeam(
          this.homeTeam,
          this.homeTeamPoints,
          this.homeTeamGoalDifference
        );
        //Update away team stats:
        await updateTeam(
          this.awayTeam,
          this.awayTeamPoints,
          this.awayTeamGoalDifference
        );
      }
    });
  }
}
