import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import UserModel from '../Models/user.models';
import { Authentication } from '../Middlewares/auth.middleware';
import { ObjectId } from 'mongoose';

dotenv.config();

const userRoute: Router = express.Router();
const SECURED_KEY = process.env.SECURED_KEY as string;

userRoute.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'This is healthy test by user.' });
});

// user Signup
userRoute.post('/signup', async (req, res) => {
    try {
        const isUser = await UserModel.findOne({ email: req.body.email });
        if (isUser) {
            return res.status(409).json({ message: 'User already registered.' });
        }
        const user = await UserModel.create({ ...req.body });
        return res.status(200).json({ message: 'Signup successful!', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
});

// user Signin
userRoute.post('/signin', async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email, password: req.body.password });
        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userID: user._id, role: user.role }, SECURED_KEY);
        return res.status(200)
            .json({ message: 'Signin successful!', user, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
});


export { userRoute };
