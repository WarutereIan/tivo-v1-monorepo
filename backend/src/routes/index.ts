import { Application } from "express";

export const configureRoutes = (app: Application)=>{
    app.use('/api/v1/user/auth', require('./api/userAuth'))
    
}