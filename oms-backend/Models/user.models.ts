import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'customer' | 'staff' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

// Define the schema
const UserSchema: Schema<IUser> = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        role: {
            type: String,
            enum: ['customer', 'staff', 'admin'],
            default: 'customer',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Create and export the model
const UserModel: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;

