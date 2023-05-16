import express,{ Express } from "express"
import cookieParser from 'cookie-parser'
import mongoSanitize from "express-mongo-sanitize"
import helmet from 'helmet'
import hpp from 'hpp'
import { logger } from "./logger"
import expressRateLimit from 'express-rate-limit'
import cors from 'cors'

const xss = require('xss-clean')

export const configureMiddleware = (app:Express) =>{
    //body parser middleware
    app.use(express.json())

    //Form parser middleware
    app.use(express.urlencoded({extended:true}))

    //cookie parser middleware
    app.use(cookieParser())

    //MongoDB sanitize middleware
    app.use(mongoSanitize())

    //Helmet api security by setting additional headers
    app.use(helmet())

    //prevent XSS attacks
    app.use(xss())

    //prevent http param pollution
    app.use(hpp())

    //use logger middleware
    app.use(logger)

    //use api rate limit
    app.use(
        expressRateLimit({
            windowMs: 10*60*1000, //10 minutes
            max: 1000,
        })
    )


    //enable cors
    app.use(cors())
}