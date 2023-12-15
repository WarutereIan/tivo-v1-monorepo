import { Router } from "express";
import { validateToken } from "../../middlewares/auth";
import { Football } from "../../controllers/tivoBetHandler";
import { Wallets } from "../../services/wallets.ts/Wallets";
import { Betslips } from "../../services/betslips/Betslips";
import { deposit } from "../../services/payments/deposits/userDeposit";
import { withdraw } from "../../services/payments/withdrawals/UserWithdrawals";
import { playInstantVirtual } from "../../services/instantVirtual/clientInterface";

const router = Router();

router.post("/createBetslip", validateToken, Football.createBetslip);

router.get("/getWalletBalance", validateToken, Wallets.getBalance);

router.get("/getBetslips", validateToken, Betslips.getUserBetslips);

router.post("/importBetslip", validateToken, Betslips.importBetslip);

router.post("/deposit", validateToken, deposit);

router.post("/withdraw", validateToken, withdraw);

router.post("/play-instant-virtual", validateToken, playInstantVirtual);

module.exports = router;
