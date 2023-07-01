import { Router } from "express";
import { validateToken } from "../../middlewares/auth";
import { Football } from "../../controllers/betHandler";

const router = Router();

router.post("/createBetslip", validateToken, Football.createBetslip);

module.exports = router;
