import express, { Request, Response, Application } from 'express';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { ENV } from './Config/env';
// console.log(ENV.MONGODB_URI);
// import '../oms-backend/types/express/index'; // TEMP only
import dotenv from 'dotenv';
dotenv.config();
// import dotenv from 'dotenv';
import cors from 'cors';
import { ConnectToDB } from './Config/db';
import { userRoute } from './Routes/user.routes';
import { productRouter } from './Routes/product.routes'
import { orderRouter } from './Routes/order.routes';
// dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true, // if you're sending cookies or authentication
}));
// Ensure log directory exists
const logDirectory = path.join(__dirname, 'Logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Logger stream
const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, 'server.log'),
    { flags: 'a' }
);

// Middlewares
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json());
// app.use(cors())


// Health check
app.get('/healthyz', (req: Request, res: Response): void => {
    res.json({ message: 'API healthy test, success.' });
});


// Routes
app.use('/user', userRoute);
app.use('/product', productRouter)
app.use('/order', orderRouter)


// server start after DB connection
ConnectToDB(ENV.MONGODB_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch((err: unknown) => {
        console.error('Error connecting to DB:', err);
    });
