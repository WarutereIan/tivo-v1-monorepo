import { createHmac } from "crypto";
import { config } from "../../config/config";
import { NextFunction, Request, Response } from "express";

/**
 * Signature is calculated using HMAC-SHA256 algorithm
 * @param message: the request body
 */
export const signRequest = (message: {}) => {
  let hmac = createHmac("sha256", config.SOFTSWISS.AUTH_TOKEN);

  let data = hmac.update(JSON.stringify(message));

  let hash = data.digest("hex");

  return hash;
};

/**
 *
 * @param signature: sent in the X-REQUEST-SIGN header of the request
 */
export const verifyRequestSignature = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let signature = req.get("X-REQUEST-SIGN");
  let sha256 = createHmac("sha256", config.SOFTSWISS.AUTH_TOKEN)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (sha256 === signature) {
    next();
  } else {
    res.status(403).end();
  }
};
