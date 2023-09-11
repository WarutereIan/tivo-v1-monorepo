import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { InstantVirtual } from "../../models/InstantVirtual";
import { Worker } from "worker_threads";
import { InstantVirtualMatch } from "./instantVirtualMatch";

export const playInstantVirtual = async (req: Request, res: Response) => {
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

  const userID = req.user?.id;

  const { prediction, amountStaked, homeTeam, awayTeam } = req.body;

  try {
    const instantVirtual = await InstantVirtual.create({
      prediction: prediction,
      userID: userID,
      amountStaked: amountStaked,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
    });

    const matchID = instantVirtual?.id;

    const instantVirtualMatch = new InstantVirtualMatch(
      matchID,
      homeTeam,
      awayTeam
    );

    const worker = new Worker(__dirname + "/worker.js", {
      workerData: {
        matchID: matchID,
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        path: "./worker.ts",
      },
    });

    /**
     *   //do this in main thread/process? let's see
        await InstantVirtual.findOneAndUpdate(
          { _id: this.matchID },
          {
            results: this.matchResults,
          }
        );
     */

    worker.on("message", (msg) => {
      return res.status(200).json({ success: true, msg });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
