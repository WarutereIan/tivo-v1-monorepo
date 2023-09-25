import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { InstantVirtual } from "../../models/InstantVirtual";
import { Worker } from "worker_threads";
import { InstantVirtualMatch } from "./instantVirtualMatch";
import { Wallet } from "../../models/Wallet";

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
    //calculate match odds?
    //use fixed odds for a start, say 1.4

    const odds = 1.35;

    /**
     * New strategy: Instant virtual wil run as independent scalable container
     *
     * So, loosely couple it all, with auth as a microservice, payments as microservice?
     */

    const instantVirtual = await InstantVirtual.create({
      prediction: prediction,
      userID: userID,
      amountStaked: amountStaked,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      played: false,
      won: false,
    });

    const matchID = instantVirtual?.id;

    //fetch match odds from existing odds: generate odds from already established bookmaker as based on team strengths

    const userWallet = await Wallet.findOne({ ownerID: userID });
    if (userWallet) {
      userWallet.currentBalance -= amountStaked;
      await userWallet.save();
    } else {
      throw new Error(
        `Could not fetch user wallet for instant virtual: User:${userID}`
      );
    }

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

    worker.on("message", async (msg) => {
      console.log(msg);

      const msgFormat = {
        homeTeamGoals: 0,
        awayTeamGoals: 0,
        totalGoals: 0,
        winner: "X",
        draw: true,
      };

      //user won
      if (msg.winner == instantVirtual.prediction) {
        const winnings = amountStaked * odds;

        //update wallet with winnings,
        const userWallet = await Wallet.findOne({ ownerID: userID });
        if (userWallet) {
          userWallet.currentBalance += winnings;
          await userWallet.save();
          console.log(
            `User wallet updated with instant virtual winnings: User:${userID}, instantVirtual: ${instantVirtual.id}, amount: ${amountStaked}`
          );
        }

        //then update instant virtual doc
        instantVirtual.results = msg;
        instantVirtual.played = true;
        instantVirtual.won = true;

        await instantVirtual.save();

        return res.status(200).json({ success: true, won: true, msg });
      } else {
        //only update instant virtual doc
        instantVirtual.results = msg;
        instantVirtual.played = true;
        instantVirtual.won = false;

        
        await instantVirtual.save();

        return res.status(200).json({ success: true, won: false, msg });
      }
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
