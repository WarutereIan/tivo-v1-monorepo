//for betslips that a particular game id should be monitor:
//if a betslip has a gameid listed in it then it is added to this list, so that when the
//game ends the betslip is checked under the particular gameId, to see whether picks for that game
//pass

export type subscribedBetslip = {
    betslipId: string,
    processed: boolean
}

export interface ISubscribedBetslips {
    gameID: string,
    betslips: subscribedBetslip[]
}