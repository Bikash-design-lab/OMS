import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
    MONGODB_URI: process.env.MONGODB_URI || '',
    PORT: parseInt(process.env.PORT || '5000', 10),
};


// import dotenv from 'dotenv';
// dotenv.config();

// export const ENV = {
//     PORT: process.env.PORT || '3000',
//     MONGODB_URI: process.env.MONGODB_URI || '',
//     CLIENT_BASE_URL: process.env.CLIENT_BASE_URL || '',
//     SECURED_KEY: process.env.SECURED_KEY || '',
// };
