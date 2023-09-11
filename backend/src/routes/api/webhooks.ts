import { Router } from "express";
import { processKoraResponse } from "../../webhooks/korapayDeposits";

const router = Router();

router.post("/korapay-deposits", processKoraResponse);

router.post("/korapay-withdrawals");

module.exports = router;
