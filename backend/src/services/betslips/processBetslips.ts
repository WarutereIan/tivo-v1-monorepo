import { Betslip } from "../../models/Betslip";
import { Match } from "../../models/Match";
import { gamePick } from "../../types/IBetslip";

export class processBetslips {
  static processBetslips = async () => {
    try {
      for await (const betslip of Betslip.find({
        processing_completed: false,
      })) {
        let matches = betslip.games;

        let matchesProcessed: gamePick[] = [];

        //compute whether all matches have been  checked in betslip

        for (let match of matches) {
          if (!match.processed) {
            const gameResults = await Match.findById(match.match_id).select(
              "results"
            );

            if (gameResults?.results) {
              const gameWinner = gameResults.results.winner;

              let matchFinal: gamePick;
              match.predicted_winner === gameWinner
                ? (matchFinal = { ...match, won: true, processed: true })
                : (matchFinal = { ...match, won: false, processed: true });

              matchesProcessed.push(matchFinal);
            }
          } else matchesProcessed.push(match);
        }

        betslip.games = matchesProcessed;

        //use a foreach method to && processed for each match & an initial slip processed bool
        let _slipProcessed = true;

        matchesProcessed.forEach((match: any) => {
          _slipProcessed = match.processed && _slipProcessed;
        });

        betslip.processing_completed = _slipProcessed;

        //if all matches have been checked get the individual match results and mark won on betlsip
        if (_slipProcessed) {
          let _slipWon = true;

          matchesProcessed.forEach((match) => {
            _slipWon = match.won && _slipWon;
          });

          betslip.won = _slipWon;

          console.log("Betslip", betslip.id, "processing completed");
        }

        betslip.__v++;

        /* console.log(
          "Betslip",
          betslip.id,
          "processing completed, won:",
          betslip.won
        ); */
        await betslip.save();
      }
    } catch (err) {
      console.error(err);
    }
  };
}
