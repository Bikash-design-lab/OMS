import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface defining the shape of a product document
export interface IProduct extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

// Define the product schema
const ProductSchema: Schema<IProduct> = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0 },
        category: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Create the model with type safety
const ProductModel: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default ProductModel;
