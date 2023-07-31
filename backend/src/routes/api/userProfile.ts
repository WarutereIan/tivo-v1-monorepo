import { Router } from "express";
import { validateToken } from "../../middlewares/auth";
import { Football } from "../../controllers/betHandler";
import { Wallets } from "../../services/wallets.ts/Wallets";
import { Betslips } from "../../services/betslips/Betslips";
import { deposit } from "../../services/payments/userDeposit";

const router = Router();

router.post("/createBetslip", validateToken, Football.createBetslip);

router.get("/getWalletBalance", validateToken, Wallets.getBalance);

router.get("/getBetslips", validateToken, Betslips.getUserBetslips);

router.post("/importBetslip", validateToken, Betslips.importBetslip);

router.post("/deposit", validateToken, deposit);

module.exports = router;
