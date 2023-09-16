import { Router } from "express";
import { authorizeBatchWithdrawal } from "../../services/payments/admin/authorizeMonnifyWithdrawal";

const router = Router();

router.post("/authorizeMonnifyWithdrawal", authorizeBatchWithdrawal);

module.exports = router;
