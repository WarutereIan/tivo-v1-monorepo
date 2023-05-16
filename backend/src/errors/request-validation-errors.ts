import { ValidationError } from "express-validator";
import { CustomError } from "./custom-errors";

export class RequestValidationError extends CustomError {
    statusCode = 400
    constructor( public errors: ValidationError[]){
        super('Invalid Request Params')
        console.log({errors})

        Object.setPrototypeOf(this, RequestValidationError.prototype)
    } 

    serializeErrors(){
        return this.errors.map((err)=>{
            return {msg: err.msg, field: err.param, value: err.value}
        })
    }
}