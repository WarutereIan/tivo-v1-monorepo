import { connectDB } from "./config/db";
import { PlayRound } from "./services/gameManager";

connectDB().then(()=>{
    console.log('connected')
})

const matches = new PlayRound(0)

