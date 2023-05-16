export interface IUser {
    username: string,
    phone_number: string,
    country: string,
    email: string,
    password: string,
    reset_code: string,
    city: string,
    zip_code: string,
    email_verified: boolean,
    email_otp: string,
    wallet: string,
    betslips: string[], //betslip ids 
}
