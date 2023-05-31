import { Subject } from "rxjs";
import { MainserviceService } from "./footballMatchSimulator/mainservice.service";
import { MatchsettingsComponent } from "./footballMatchSimulator/matchsettings.module";
import { ScoreboardComponent } from "./footballMatchSimulator/scoreboard.component";
import { StatsComponent } from "./footballMatchSimulator/stats.component";
import fs from "fs";

export class MatchSubject {
  mainService!: MainserviceService;
  matchSettings!: MatchsettingsComponent;
  matchStats!: StatsComponent;
  matchPlay!: ScoreboardComponent;
  matchID!: string;
  homeTeam!: string;
  awayTeam!: string;
  MatchStats = new Subject<any>();

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

    this.matchSettings.ChangeRelativeStrength(1);

    this.matchSettings.ChangeHomeCrowdSupport(1);

    this.matchSettings.ChangeHomeTeamMorale(1);

    this.matchSettings.ChangeAwayTeamMorale(1);

    this.matchSettings.ChangeHomeTeamTactics(1);

    this.matchSettings.ChangeAwayTeamTactics(1);

    this.matchSettings.proceedToMatch();

    this.matchPlay.startMatch();

    //data for each game is to be streamed from here?
    this.matchStats.stats.subscribe((res: any) => {
      this.MatchStats.next({
        matchID: this.matchID,
        res,
      });
    });
  }
}
