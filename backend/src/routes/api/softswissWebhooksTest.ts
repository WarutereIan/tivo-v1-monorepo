import { Router } from "express";
import {
  GCP_TO_WALLET_REQUESTS,
  processSwissResult,
} from "../../webhooks/softswiss";
import { verifyRequestSignature } from "../../utils/softswiss/reqVerification";

const router = Router();

router.post("/play", verifyRequestSignature, GCP_TO_WALLET_REQUESTS.play);

router.post(
  "/rollback",
  verifyRequestSignature,
  GCP_TO_WALLET_REQUESTS.rollbackRequest
);

module.exports = router;
