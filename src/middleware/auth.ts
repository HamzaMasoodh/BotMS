import * as jwt from 'jsonwebtoken';
import { User } from '../model/userModel';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';

dotenv.config();

const auth = async (req:Request, res:Response , next:any)=>{
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded:any = jwt.verify(token, "botmonitorsecret");
        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token,
        });
        if (!user) {
            throw new Error("Faild to authenticate");
        }
        req.token = token;
        req.user = user;
        next();
    } catch (e:any) {
        res.status(401).send({ message: "Faild to authenticate", errMessage: e.message });
        
    }
}

export default auth;
