export type resultType = {
    goals_home: string,
    goals_away: string,
    goals_total: string,
    winner: string,
    draw: boolean
} 

export interface IGameResult {
    gameID: string,
    results: resultType[]
}