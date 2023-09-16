import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { generateAccessToken } from "../deposits/monnify";
import { config } from "../../../config/config";
import axios from "axios";

export const authorizeBatchWithdrawal = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  let { reference, authorizationCode } = req.body;

  try {
    const monnifyToken = await generateAccessToken();

    const authorizationData = {
      reference: reference, //insert from batchDB,
      authorizationCode: authorizationCode,
    };

    const axiosConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${config.MONNIFY.MONNIFY_BASE_URL_TEST}/api/v2/disbursements/batch/validate-otp`,
      headers: {
        Authorization: `Bearer ${monnifyToken}`,
      },
      data: authorizationData,
    };

    const response = await axios(axiosConfig);

    console.log(response.data);
  } catch (err) {
    console.error(err);
  }
};
