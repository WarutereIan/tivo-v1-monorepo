import { connect } from "mongoose"
import { config } from "./config"

export const connectDB = async () =>{
    console.log(`- - -`.repeat(10))
    console.log('uri', config.PORT)
    try{
        const options = {
            useUnifiedTopology: true,
            keepAlive: true,
            connectTimeoutMS: 60000,
            socketTimeoutMS: 60000
        }
        const db = await connect(config.MONGO_URI, options)
        console.log('Connected to MongoDB ✅✅✅')
        return db
    }
    catch(err:any){
        console.error(err.message)
        process.exit(1)
    }
}