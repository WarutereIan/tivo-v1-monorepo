import Express from 'express'
import { getMatch} from './playSampleGame'

const app = Express()

app.get('/',getMatch)

app.listen(5000,()=>{
    console.log('server running on port 5000')
})