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
import { RedisClient } from "../config/db";

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

  //guide on how the numbers influence outcomes in each of these aspects of match settings:
  //the numbers represent the position of an element in the respective array of the specific setting
  /**
   * 
   * relativeStrengths: string[] = [
    `Hosts much weaker than Visitors`,
    `Hosts weaker than Visitors`,
    `Hosts a bit weaker than Visitors`,
    `Hosts and Visitors equal in class`,
    `Hosts a bit stronger than Visitors`,
    `Hosts stronger than Visitors`,
    `Hosts much stronger than Visitors`,
  ];

  homeCrowdSupports: string[] = [
    `Hosts have no support`,
    `Hosts have weak support`,
    `Hosts have average support`,
    `Hosts enjoy good support`,
    `Hosts enjoy outstanding support`,
    `Teams play on neutral venue`,
    `Random support`,
  ];

  morale: string[] = [ (motivations == morale)
    `Extremely low`,
    `Low`,
    `Average`,
    `High`,
    `Extremely high`,
    `Random`,
  ];

  tactics: string[] = [
    'Defensive',
    'Counter',
    'Balanced',
    'Possession',
    'Attacking',
    'Random',
  ];
   */

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

        console.log(
          "home team goals",
          this.homeTeam,
          " ",
          this.homeTeamGoalsResult
        );
        console.log(
          "away team goals",
          this.awayTeam,
          " ",
          this.awayTeamGoalsResult
        );

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

        await Match.findOneAndUpdate(
          { _id: this.matchID },
          {
            results: this.matchResults,
          }
        );

        //Update home team stats:
        await updateTeam(
          "home",
          this.homeTeam,
          this.homeTeamPoints,
          this.homeTeamGoalDifference,
          this.homeTeamGoalsResult,
          this.awayTeamGoalsResult
        );
        //Update away team stats:
        await updateTeam(
          "away",
          this.awayTeam,
          this.awayTeamPoints,
          this.awayTeamGoalDifference,
          this.awayTeamGoalsResult,
          this.homeTeamGoalsResult
        );

        await RedisClient.set("roundStartedBool", "false");
      }
    });
  }
}
