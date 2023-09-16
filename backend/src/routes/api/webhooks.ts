import { Router } from "express";
import { processKoraResponse } from "../../webhooks/korapayDeposits";
import { monnifyDepoWebhook } from "../../webhooks/monnifyDeposits";
import { monnifyWithdrawlsWebhook } from "../../webhooks/monnifyWithdrawals";

const router = Router();

router.post("/korapay-deposits", processKoraResponse);

router.post("/korapay-withdrawals");

router.post("/monnify-deposits", monnifyDepoWebhook);

router.post("/monnify-withdrawals", monnifyWithdrawlsWebhook);

module.exports = router;
