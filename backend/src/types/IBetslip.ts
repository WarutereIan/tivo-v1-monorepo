export type gamePick = {
    gameID: string,
    gamePredictions: string //settle whether string, or array indicative of picks, or object. String provides easiest computation 4 comparison
}

export interface IBetslip {
    userID: string,
    picks: gamePick[]
}