import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

const SECURED_KEY = process.env.SECURED_KEY as string;

type Role = 'customer' | 'staff' | 'admin';

export interface AuthRequest extends Request {
    userID?: Types.ObjectId;
    role?: Role;
}

interface DecodedToken {
    userID: Types.ObjectId;
    role: Role;
}

export const Authentication = (allowedRoles: Role[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Token not found.' });
            }

            const decoded = jwt.verify(token, SECURED_KEY) as DecodedToken;

            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'User role not authorized.' });
            }

            req.userID = decoded.userID;
            req.role = decoded.role;

            next();
        } catch (error: unknown) {
            console.error(error);
            return res
                .status(500)
                .json({ message: 'An unexpected error occurred.', error });
        }
    };
};

