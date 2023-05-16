import { compare, genSalt, hash } from "bcrypt";

export class Password {
    static async Hash(password: string){
        const salt = await genSalt(10)
        return hash(password, salt)
    }

    static compare(storedPassword: string, suppliedPassword: string){
        return compare(suppliedPassword, storedPassword)
    }

    static validate(password: string){
        if(password.length<6){
            return {
                error: 'Password must be at least 6 characters'
            }
        }
        //ensure that password contains a number
        if(!/\d/.test(password)){
            return {
                error: 'Password must contain a number'
            }
        }

        //ensure password contains an uppercase letter
        if(!/[A-Z]/.test(password)){
            return {
                error: 'Password must contain an uppercase letter'
            }
        }

        return{
            error: null
        }
    }
}