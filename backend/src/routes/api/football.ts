import { Router } from "express";
import { seasonFixtures } from "../../services/gameManager";

const router = Router();

router.get("/getLiveRoundStats");

router.get("/getSeasonFixtures", seasonFixtures.getFixturesFromCache);

module.exports = router;
