import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const GetUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // The ?. (optional chaining) ensures that if req.headers['authorization'] is undefined or null, it won't throw an error. Instead, it will simply return undefined and avoid crashing the application.
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(404).json({ message: "invalid token" })
    }
    else {

        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
            console.log(!decoded)
            if (!decoded) {
                res.status(401).json({ message: "Unauthorized User" })
            }
            if (typeof decoded === "object") {
                req.body.id = decoded.id;
                next()
            }
            else {
                return res.status(401).json({ message: "Unauthorized User" })
            }
        }
        catch (e) {
            return res.status(401).json({ message: "Unauthorized User", error: e })
        }
    }
}