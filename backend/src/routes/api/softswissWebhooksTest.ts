import { Router } from "express";
import {
  
  GCP_play,
  GCP_rollback,
  processSwissResult,
} from "../../webhooks/softswiss";
import { verifyRequestSignature } from "../../utils/softswiss/reqVerification";

const router = Router();

router.post("/play", verifyRequestSignature, GCP_play);

router.post(
  "/rollback",
  verifyRequestSignature,
  GCP_rollback
);

module.exports = router;
