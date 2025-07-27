import mongoose, { Document, Schema, Model } from 'mongoose';

interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    price: number;
    totalAmount: number;
}

interface IStatusHistory {
    status: 'placed' | 'picked' | 'shipped' | 'cancelled';
    timestamp?: Date;
    updatedBy: string;
}

export interface IOrder extends Document {
    customerId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    productStatus: 'placed' | 'picked' | 'shipped' | 'cancelled';
    paymentCollected: boolean;
    paymentStatus: 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED';
    shippingAddress: {
        address: string;
        state: string;
    };
    notes?: string;
    productStatusHistory: IStatusHistory[];
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
    {
        customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                productName: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
                totalAmount: { type: Number, required: true, min: 0 },
            },
        ],
        productStatus: {
            type: String,
            enum: ['placed', 'picked', 'shipped', 'cancelled'],
            default: 'placed',
        },
        paymentCollected: { type: Boolean, default: false },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID', 'FULFILLED', 'CANCELLED'],
            default: 'PENDING',
        },
        shippingAddress: {
            address: { type: String, required: true, default: 'Kolkata' },
            state: { type: String, required: true },
        },
        notes: { type: String },
        productStatusHistory: [
            {
                status: {
                    type: String,
                    enum: ['placed', 'picked', 'shipped', 'cancelled'],
                    required: true,
                },
                timestamp: { type: Date, default: Date.now },
                updatedBy: { type: String, required: true },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const OrderModel: Model<IOrder> =
    mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default OrderModel;

