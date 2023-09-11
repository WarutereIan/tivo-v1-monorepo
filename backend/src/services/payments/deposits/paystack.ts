import https from "https";
import { config } from "../../../config/config";
import { response } from "express";

export const usePaystack = async (amount: number, email: string) => {
  try {
    const paystackSecret = config.PAYSTACK_SECRET;
    let _data = "";
    let data: any;

    const params = JSON.stringify({
      email: email,
      amount: JSON.stringify(amount * 100),
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `BEARER ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    };

    const reqPaystack = https
      .request(options, (resPaystack) => {
        resPaystack.on("data", (chunk) => {
          _data += chunk;
        });

        //TODO: add functionality to store the reference codes/ids, and then check these periodically to update status; cron jobs
        resPaystack.on("end", () => {
          let dataObj = JSON.parse(_data);
          let url = dataObj.data.authorization_url;
          let referenceId = dataObj.reference;
          return response.status(200).redirect(url);
        });
      })
      .on("error", (error) => {
        throw error;
      });

    reqPaystack.write(params);
    reqPaystack.end();
  } catch (err) {
    console.error(err);
    return response.status(500).send("Internal server error");
  }

  //let url = data.data.authorization_url;
};
