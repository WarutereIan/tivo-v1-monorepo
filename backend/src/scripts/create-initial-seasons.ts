import { connectDB } from "../config/db";
import { Season } from "../models/Season";

(async () => {
  await connectDB();
})();

const leagues = ["EPL", "LaLiga", "SerieA", "Bundesliga"];

async function createSeasons(leagues: string[]) {
  leagues.forEach((league) => {
    Season.create({
      currentSeasonNumber: 0,
      league: league,
      total_goals_scored_away_last_season: 0,
      total_goals_scored_home_last_season: 0,
      last_season_away_mean_conceded: 0,
      last_season_away_mean_scored: 0,
      last_season_home_mean_conceded: 0,
      last_season_home_mean_scored: 0,
    }).then((res) => {
      console.log("Created inital season \n", res);
    });
  });
}

createSeasons(leagues).then(() => {
  console.log("created seasons");
});
