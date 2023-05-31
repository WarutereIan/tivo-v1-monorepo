
import { RedisClient, connectDB } from "./config/db";
import { PlayRound, seasonFixtures } from "./services/gameManager";
import { Request, response, request } from "express";

connectDB().then(() => {
  seasonFixtures.storeFixturesInCache().then((res) => {});

  seasonFixtures.getFixturesFromCache(request, response).then((res) => {});
});

function startRound<PlayRound>(roundNumber: number) {
  return new PlayRound(roundNumber);
}

//export const matches = startRound(1)
