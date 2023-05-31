//import { Component, OnInit } from '@angular/core';
import {
  Observable,
  combineLatest,
  combineLatestAll,
  concat,
  forkJoin,
  mergeAll,
  startWith,
  zip,
} from "rxjs";
import { MainserviceService } from "./mainservice.service";

export class StatsComponent {
  // what came to ScoreBoard from Match Settings
  matchHasStarted!: boolean;
  homeTeamName!: string;
  awayTeamName!: string;
  isSecondLeg!: boolean;
  homeTeam1stLegGoals!: number;
  awayTeam1stLegGoals!: number;
  homeRelativeStrength!: number;
  awayRelativeStrength!: number;
  homeCrowdSupport!: number;
  homeTeamMorale!: number;
  awayTeamMorale!: number;
  homeTeamTactics!: number;
  awayTeamTactics!: number;
  stats!: any;
  statsObject!: any;
  matchID!: string;

  // what came from scoreboard component
  matchMinutes: number = 0;
  matchSeconds: number = 0;
  homeTeamGoals: number = 0;
  awayTeamGoals: number = 0;
  allPotentialShots!: number;
  homeTeamPotentialShots!: number;
  awayTeamPotentialShots!: number;
  homeTeamActualShots: number = 0;
  awayTeamActualShots: number = 0;
  // constant determining what share of shots should be actually shots on target (between 0.25 and 0.5)
  readonly SHOT_IS_SHOT_ON_GOAL = Math.random() * (0.5 - 0.1) + 0.1;
  homeTeamShotsOnGoal: number = 0;
  awayTeamShotsOnGoal: number = 0;
  homeTeamPossession: number = 50;
  awayTeamPossession: number = 50;
  homeTeamFouls: number = 0;
  awayTeamFouls: number = 0;
  homeTeamYellowCards: number = 0;
  awayTeamYellowCards: number = 0;
  homeTeamRedCards: number = 0;
  awayTeamRedCards: number = 0;

  constructor(private _mainService: MainserviceService) {
    //create stats observable to stream match stats to subscribers

    this.stats = combineLatest([
      //this._mainService.matchID,
      this._mainService.homeTeamPossession.pipe(startWith(0)),
      this._mainService.awayTeamPossession.pipe(startWith(0)),
      this._mainService.homeTeamFouls.pipe(startWith(0)),
      this._mainService.awayTeamFouls.pipe(startWith(0)),
      this._mainService.homeTeamYellowCards.pipe(startWith(0)),
      this._mainService.awayTeamYellowCards.pipe(startWith(0)),
      this._mainService.homeTeamRedCards.pipe(startWith(0)),
      this._mainService.awayTeamRedCards.pipe(startWith(0)),
      this._mainService.homeTeamActualShots.pipe(startWith(0)),
      this._mainService.awayTeamActualShots.pipe(startWith(0)),
      this._mainService.homeTeamShotsOnGoal.pipe(startWith(0)),
      this._mainService.awayTeamShotsOnGoal.pipe(startWith(0)),
      this._mainService.homeTeamGoals.pipe(startWith(0)),
      this._mainService.awayTeamGoals.pipe(startWith(0)),
    ]);

    this._mainService.matchID.subscribe((data) => {
      this.matchID = data;
    });

    this._mainService.matchHasStarted.subscribe((data) => {
      this.matchHasStarted = data;
    });
    this._mainService.homeTeamName.subscribe((data) => {
      this.homeTeamName = data;
    });
    this._mainService.awayTeamName.subscribe((data) => {
      this.awayTeamName = data;
    });

    // is second leg
    this._mainService.isSecondLeg.subscribe((data) => {
      this.isSecondLeg = data;
    });

    // first leg goals
    this._mainService.homeTeam1stLegGoals.subscribe((data) => {
      this.homeTeam1stLegGoals = data;
    });
    this._mainService.awayTeam1stLegGoals.subscribe((data) => {
      this.awayTeam1stLegGoals = data;
    });

    // relative strength of home team
    this._mainService.homeRelativeStrength.subscribe((data) => {
      this.homeRelativeStrength = data;
    });
    // relative strength of away team
    this._mainService.awayRelativeStrength.subscribe((data) => {
      this.awayRelativeStrength = data;
    });

    // home crowd support
    this._mainService.homeCrowdSupport.subscribe((data) => {
      this.homeCrowdSupport = data;
    });

    // homeTeamMorale
    this._mainService.homeTeamMorale.subscribe((data) => {
      this.homeTeamMorale = data;
    });
    // awayTeamMorale
    this._mainService.awayTeamMorale.subscribe((data) => {
      this.awayTeamMorale = data;
    });

    // homeTeamTactics
    this._mainService.homeTeamTactics.subscribe((data) => {
      this.homeTeamTactics = data;
    });
    // awayTeamTactics
    this._mainService.awayTeamTactics.subscribe((data) => {
      this.awayTeamTactics = data;
    });

    // homeTeam possession
    this._mainService.homeTeamPossession.subscribe((data) => {
      this.homeTeamPossession = data;
      //this.stats.next(data)
      //console.log('home team possession', data)
    });
    // awayTeam possession
    this._mainService.awayTeamPossession.subscribe((data) => {
      this.awayTeamPossession = data;
    });

    // homeTeamFouls
    this._mainService.homeTeamFouls.subscribe((data) => {
      this.homeTeamFouls = data;
    });
    // awayTeamFouls
    this._mainService.awayTeamFouls.subscribe((data) => {
      this.awayTeamFouls = data;
    });

    // homeTeamYellowCards
    this._mainService.homeTeamYellowCards.subscribe((data) => {
      this.homeTeamYellowCards = data;
    });
    // awayTeamYellowCards
    this._mainService.awayTeamYellowCards.subscribe((data) => {
      this.awayTeamYellowCards = data;
    });

    // homeTeamRedCards
    this._mainService.homeTeamRedCards.subscribe((data) => {
      this.homeTeamRedCards = data;
    });
    // awayTeamRedCards
    this._mainService.awayTeamRedCards.subscribe((data) => {
      this.awayTeamRedCards = data;
    });

    // home team total attempts
    this._mainService.homeTeamActualShots.subscribe((data) => {
      this.homeTeamActualShots = data;
      //console.log('home team attempts on goal', data)
    });
    // away team total attempts
    this._mainService.awayTeamActualShots.subscribe((data) => {
      this.awayTeamActualShots = data;
    });

    // home team shots on goal
    this._mainService.homeTeamShotsOnGoal.subscribe((data) => {
      this.homeTeamShotsOnGoal = data;
      //console.log('home team shots on goal', data)
    });
    // away team shots on goal
    this._mainService.awayTeamShotsOnGoal.subscribe((data) => {
      this.awayTeamShotsOnGoal = data;
    });

    // home team goals
    this._mainService.homeTeamGoals.subscribe((data) => {
      this.homeTeamGoals = data;
      //console.log('home team goals ', data)
    });
    // away team goals
    this._mainService.awayTeamGoals.subscribe((data) => {
      this.awayTeamGoals = data;
    });
  } // constructor ends
}
