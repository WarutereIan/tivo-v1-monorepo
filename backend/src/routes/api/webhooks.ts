import { Router } from "express";
import { processKoraResponse } from "../../../webhooks/korapay";

const router = Router();

router.post("/korapay", processKoraResponse);

module.exports = router;
