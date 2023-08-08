import { Router } from "express";
import { seasonFixtures } from "../../services/gameManager";
import { RoundPlayingNow } from "../../helpers/roundScheduler";

const router = Router();

//changed to socket.io implementation
//router.get("/getLiveRoundStats", RoundPlayingNow.getCurrentRoundStats);

router.get("/getSeasonFixtures", seasonFixtures.getFixturesFromCache);

router.get("/getNextRoundMatches", RoundPlayingNow.getNextRoundMatches);

module.exports = router;
