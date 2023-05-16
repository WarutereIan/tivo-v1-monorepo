import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { User } from "../models/User";
import { Password } from "../helpers/password";
import { Wallet } from "../models/Wallet";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";


export const signUp = async (req: Request, res: Response)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        console.log(errors)
        let _errors = errors.array().map((error)=>{
            return {
                msg: error.msg,
                field: error.param,
                success: false,
            }
        })[0]
        return res.status(400).json(_errors)
    }

    const {
        username,
        phone_number,
        email,
        password,
        confirm_password
    } = req.body

    if(password !== confirm_password){
        return res.status(400).json({
            msg:'Passwords do not match',
            success: false
        })
    }

    if (await User.exists({ username })) {
        return res.status(400).json({
            msg: 'Username already exists',
            success: false,
        })
    }
    if (await User.exists({ phone_number })) {
        return res.status(400).json({
            msg: 'Phone Number already exists',
            success: false,
        })
    }
    if (await User.exists({ email })) {
        return res.status(400).json({
            msg: 'Email already exists',
            success: false,
        })
    }

    //validate password
    const {error} = Password.validate(password)
    if(error){
        return res.status(400).json({
            msg: error,
            success: false,
        })
    }

    try{
        //create wallet
        let wallet = await Wallet.create({
            currentBalance: 0
        })

        //create user:
        const user = await User.create({
        username,
        phone_number,
        email,
        password,
        confirm_password
        })

        const payload = {
            user: {
                id: user._id
            }
        }
        sign(
            payload,
            config.JWT_SECRET,
            {
                expiresIn: '1h'
            },
            (err, token)=>{
                if (err) throw err
                res.status(200).json({token, success: true})    
            }
        )
    }
    catch(err:any){
        console.error(err.message)
        return res.status(500).json({msg:'Internal server error'})
    }
}

export const login = async(req: Request, res: Response)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        console.log(errors)
        let _errors = errors.array().map((error)=>{
            return {
                msg: error.msg,
                field: error.param,
                success: false,
            }
        })[0]
        return res.status(400).json(_errors)
    }

    let {password, email, phone_number} = req.body

    try{
        let user

        if(phone_number){
            if (!(await User.exists({ phone_number }))) {
                // throw error if user does not exist
                return res.status(400).json({
                    msg: 'User does not exist',
                    success: false,
                })
            }
            user = await User.findOne({ phone_number }).select('password phone_number')

        }
        else{

        if(!(await User.exists({ email }))){
            // throw error if user does not exist
            return res.status(400).json({
                msg: 'User does not exist',
                success: false,
            })
        }

        user = await User.findOne({ email }).select('password phone_number')
        }
        
        if (!user || !(await Password.compare(user.password, password))) {
            return res
                .status(400)
                .json({ msg: 'Invalid credentials', success: false })
        }

        // login user
        const payload = {
            id: user.id,
            phone_number: user.phone_number,
        }
        sign(
            payload,
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_TOKEN_EXPIRES_IN,
            },
            (err, token) => {
                if (err) throw err  

                    res.json({ token, success: true })
            }
        )
    }catch (err: any) {
        console.error(err.message)
        return res.status(500).send('Internal server error')
    }


}
