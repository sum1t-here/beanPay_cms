import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.split(" ")?.[1];

    if(!token){
        return res.status(403).json({
            message: "Missing token"
        })
    }

    try {
        const {userId} = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        if(userId){
            req.userId = userId;
        }
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Token malformed"
        })
    }
}