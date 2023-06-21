import mongoose from "mongoose";
import { connectDB } from "../config/db";

let dropMatches, dropTeams, dropRoundCounter, dropSeasonCounter;

try {
  (async () => {
    await connectDB();

    //drop the collections to be reset: matches, roundcounters, teams, season counters
    //find means to make it synchronous so that creation begins only after deletion

    dropMatches = await mongoose.connection.db.dropCollection("matches");
    dropTeams = await mongoose.connection.db.dropCollection("teams");
    dropRoundCounter = await mongoose.connection.db.dropCollection(
      "roundcounters"
    );
    dropSeasonCounter = await mongoose.connection.db.dropCollection(
      "seasoncounters"
    );

    Promise.all([
      dropMatches,
      dropRoundCounter,
      dropSeasonCounter,
      dropTeams,
    ]).then((res: any) => {
      let result: boolean;
      if (res) {
        result = res.reduce((acc: boolean, value: boolean) => {
          acc == value;
        });
        result ? process.exit() : console.log("did not clear dbs");
      }
    });
  })();
} catch (err) {
  console.error(err);
}
