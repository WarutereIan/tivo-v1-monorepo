import { Subject } from "rxjs";
import { Results } from "../../types/IMatch";
import { MainserviceService } from "../footballMatchSimulator/mainservice.service";
import { MatchsettingsComponent } from "../footballMatchSimulator/matchsettings.module";
import { ScoreboardComponent } from "../footballMatchSimulator/scoreboard.component";
import { StatsComponent } from "../footballMatchSimulator/stats.component";
import fs from "fs";
import { InstantVirtual } from "../../models/InstantVirtual";

export class InstantVirtualMatch {
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
  matchResults!: Results ;
  MatchStats = new Subject<any>();
  MatchStatus!: string;
  matchWinner!: string;
  matchDrawn!: boolean;
  homeTeamPoints!: number;
  awayTeamPoints!: number;
  league!: string;

  constructor(matchID: string, homeTeam: string, awayTeam: string) {
    this.matchID = matchID;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.mainService = new MainserviceService(fs);
    this.matchSettings = new MatchsettingsComponent(this.mainService);
    this.matchStats = new StatsComponent(this.mainService);
    this.matchPlay = new ScoreboardComponent(this.mainService);
  }

  //read matchID from instantVirtual match doc

  startMatch() {
    this.matchSettings.ChangeTournament("UEFA Champions League");

    this.matchSettings.ChangeHomeTeamName(this.homeTeam);

    this.matchSettings.ChangeAwayTeamName(this.awayTeam);

    this.mainService.updateMatchID(this.matchID);

    this.matchSettings.ChangeRelativeStrength(5);

    this.matchSettings.ChangeHomeCrowdSupport(4);

    this.matchSettings.ChangeHomeTeamMorale(5);

    this.matchSettings.ChangeAwayTeamMorale(4);

    this.matchSettings.ChangeHomeTeamTactics(3);

    this.matchSettings.ChangeAwayTeamTactics(5);

    this.matchSettings.proceedToMatch();

    this.matchPlay.startMatch();

    this.matchStats.stats.subscribe((res: any) => {
      this.MatchStats.next([this.matchID, ...res]);
      this.homeTeamGoalsResult = res[res.length - 2];
      this.awayTeamGoalsResult = res[res.length - 1];
    });

    this.matchStats.matchStatus.subscribe(async (res: any) => {
      if (res[0] === "Full time") {
        console.log("match ended", this.matchID);
        this.MatchStats.next(res[0]);

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
          this.matchWinner = "1";
          this.matchDrawn = false;
          this.homeTeamPoints = 3;
          this.awayTeamPoints = 0;
        } else if (this.homeTeamGoalsResult < this.awayTeamGoalsResult) {
          this.matchWinner = "2";
          this.matchDrawn = false;
          this.homeTeamPoints = 0;
          this.awayTeamPoints = 3;
        } else {
          this.matchWinner = "X";
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
      }
    });
  }
}
