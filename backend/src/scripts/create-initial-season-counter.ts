import { connectDB } from "../config/db";
import { SeasonCounter } from "../models/SeasonCounter";

(async () => {
  await connectDB();
})();

SeasonCounter.create({
  currentSeasonNumber: 0,
}).then((res) => {
  console.log("Created inital season counter document \n", res);
  process.exit();
});
