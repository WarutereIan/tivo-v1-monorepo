import axios from "axios";
import { config } from "../../../config/config";
import { Base64 } from "js-base64";
//import { retry } from "rxjs-compat/operator/retry";
import { Request, Response } from "express";
import { Deposit } from "../../../models/Deposit";

//generate base64 auth token
const apiKey = config.MONNIFY.MONNIFY_API_KEY;
const secretKey = config.MONNIFY.MONNIFY_SECRET_KEY;

const basicToken = Base64.encode(`${apiKey}:${secretKey}`);

export const generateAccessToken = async (): Promise<string> => {
  const AccessTokenRequest = {
    method: "post",
    data: {},
    //url: config.MONNIFY.MONNIFY_BASE_URL_TEST,
    url: "https://sandbox.monnify.com/api/v1/auth/login",
    headers: {
      Authorization: `Basic ${basicToken}`,
    },
  };

  const result = await axios(AccessTokenRequest);

  const accessToken = result.data.responseBody.accessToken;

  return accessToken;
};

export const useMonnify = async (
  req: Request,
  res: Response,
  userID: string,
  username: string,
  email: string,
  amount: number
) => {
  try {
    const monnifyDeposit = await Deposit.create({
      paymentGateway: "monnify",
      userId: userID,
      amount: amount,
      processed: false,
      processingStatus: "Pending",
      depositedInWallet: false,
      time: new Date().toDateString(),
    });

    const referenceId = monnifyDeposit.id;

    //capture transaction details from the customer: this is the monnify format
    const data = {
      amount: amount,
      customerName: username,
      customerEmail: email,
      paymentReference: referenceId, //to be generated, from db doc id
      paymentDescription: "Tivobet test payment for monnify",
      currencyCode: "NGN",
      contractCode: config.MONNIFY.MONNIFY_CONTRACT_CODE, //"", //contract code as provided in docs: this defines acceptable means of payins
      redirectUrl: "https://monnify.com/", //should be the tivobet profile url
      //paymentMethods:[] Not defining this field displays all the available payment methods
    };

    const authToken = await generateAccessToken();

    const depositRequest = {
      method: "post",
      data: data,
      //url: config.MONNIFY.MONNIFY_BASE_URL_TEST,
      url: "https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };

    const response = await axios(depositRequest);

    /**
   * response format: 
   * {
    "requestSuccessful": true,
    "responseMessage": "success",
    "responseCode": "0",
    "responseBody": {
        "transactionReference": "MNFY|20190915200044|000090",
        "paymentReference": "1568577644707",
        "merchantName": "Test Limited",
        "apiKey": "MK_TEST_VR7J3UAACH",
        "enabledPaymentMethod": [
            "ACCOUNT_TRANSFER",
            "CARD"
        ],
        "checkoutUrl": "https://sandbox.sdk.monnify.com/checkout/MNFY|20190915200044|000090"
    }
}
   */

    const url = response.data.responseBody.checkoutUrl;

    if (response.data.responseCode == "0") {
      return res.status(200).json({ success: true, msg: url });
    } else {
      console.error(response.data);

      return res
        .status(500)
        .json({ success: false, msg: "Internal server error" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server error" });
  }
};
