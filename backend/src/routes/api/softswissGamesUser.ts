import { Router } from "express";
import { WALLET_TO_GCP_REQUESTS } from "../../controllers/softswiss";
import { validateToken } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validate-request";

const router = Router();

router.post(
  "/create-demo-session",
  validateRequest,
  validateToken,
  WALLET_TO_GCP_REQUESTS.startDemoRequest
);

router.post(
  "/create-game-session",
  validateRequest,
  validateToken,
  WALLET_TO_GCP_REQUESTS.createSessionRequest
);

module.exports = router;
