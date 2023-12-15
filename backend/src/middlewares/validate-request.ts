import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-errors";

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) =>{
    const errors = validationResult(req)
   if (!errors.isEmpty()) {
     console.log(errors);
     let _errors = errors.array().map((error) => {
       return {
         msg: error.msg,
         field: error.param,
         success: false,
       };
     })[0];
     return res.status(400).json(_errors);
   }
    next()
}