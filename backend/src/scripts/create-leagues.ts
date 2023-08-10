import { connectDB } from "../config/db";
import { League } from "../models/League";

const teamsEPL = [
  "Arsenal",
  "Aston Villa",
  "Bournemouth",
  "Brentford",
  "Brighton",
  "Burnley",
  "Chelsea",
  "Crystal Palace",
  "Everton",
  "Fulham",
  "Liverpool",
  "Luton Town",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Nottingham Forest",
  "Sheffield United",
  "Tottenham Hotspur",
  "West Ham United",
  "Wolves",
];

const teamsLaliga = [
  "Athletic Club",
  "Atletico De Madrid",
  "CA Osasuna",
  "Cadiz CF",
  "Deportivo Alaves",
  "FC Barcelona",
  "Getafe CF",
  "Girona FC",
  "Granada CF",
  "Rayo Vallecano",
  "RC Celta",
  "RCD Mallorca",
  "Real Betis",
  "Real Madrid",
  "Real Sociedad",
  "Sevilla FC",
  "UD Almeria",
  "UD Las Palmas",
  "Valencia CF",
  "Villareal CF",
];

const teamsBundesliga = [
  "Augsburg",
  "Bayer Leverkusen",
  "Bayern Munich",
  "Bochum",
  "Borussia Dortmund",
  "Darmstadt",
  "Einracht Frankfurt",
  "Heidenheim",
  "Hoffenheim",
  "Koln",
  "Mainz",
  "Monchengladbach",
  "Leipzig",
  "Freiburg",
  "Stuttgart",
  "Union Berlin",
  "Wolfsburg",
  "Werder",
];

const teamsSerieA = [
  "Atalanta",
  "Bologna",
  "Cagliagri",
  "Empoli",
  "Fiorentina",
  "Frosinone",
  "Genoa",
  "Inter Milan",
  "Juventus",
  "Lazio",
  "Lecce",
  "AC Milan",
  "Monza",
  "Napoli",
  "Roma",
  "Salernitana",
  "Sassuolo",
  "Torino",
  "Udinese",
  "Verona",
];

(async () => {
  await connectDB();
})();

//could have looped over an array but it's done!
async function createLeague(leagueName: string, leagueTeams: string[]) {
  const league = await League.create({
    leagueName: leagueName,
    listOfTeams: leagueTeams,
  });

  console.log(leagueName, "\n", league);

  return true;
}

createLeague("EPL", teamsEPL).then((result) =>
  result ? console.log("done creating EPL league") : console.log("failed")
);

createLeague("LaLiga", teamsLaliga).then((result) =>
  result ? console.log("done creating LaLiga league") : console.log("failed")
);

createLeague("Bundesliga", teamsBundesliga).then((result) =>
  result
    ? console.log("done creating Bundesliga league")
    : console.log("failed")
);

createLeague("SerieA", teamsSerieA).then((result) =>
  result ? console.log("done creating SerieA league") : console.log("failed")
);
