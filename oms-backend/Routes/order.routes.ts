import express, { Request, Response, Router } from "express";
import { Types, ObjectId } from 'mongoose';

import OrderModel from "../Models/order.models";
import UserModel from "../Models/user.models";
import ProductModel from "../Models/product.models";
import { Authentication } from "../Middlewares/auth.middleware";

interface AuthRequest extends Request {
    userID?: ObjectId;
    role?: 'admin' | 'staff' | 'customer';
}

const orderRouter: Router = express.Router()

orderRouter.get("/test", (req: Request, res: Response) => {
    res.json({ message: "This is  healthy test from order." })
})

let specifiedRole = ["customer", "admin"]

//step-1
// this route help to place a new-initial-order 
orderRouter.post("/product-placed-payment-pending/:product_id", Authentication(["customer", "admin"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const product_id = req.params.product_id;
        const { shippingAddress, notes } = req.body;
        const address = shippingAddress?.address || "Kolkata";
        const state = shippingAddress?.state;

        if (!state) {
            return res.status(400).json({ message: "Shipping state is required." });
        }
        // console.log("Check1")
        if (!role || !specifiedRole.includes(role)) {
            return res.status(403).json({ message: "Only customer or admin can place orders." });
        }
        // console.log("Check2")
        const quantity = req.body.items?.[0]?.quantity;
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: "Please provide a valid quantity." });
        }
        // console.log("check3")
        const isUser = await UserModel.findById(userID);
        if (!isUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // console.log("check4")
        const product = await ProductModel.findById(product_id);
        if (!product) {
            return res.status(404).json({ message: "Product not found, please re-confirm product_id" });
        }
        // console.log("cehck5")

        if (product.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }
        // console.log("cehck6")
        const totalAmount = quantity * product.price;

        // Place the order
        const product_Placed_Payment_Pending = await OrderModel.create({
            customerId: userID,
            items: [
                {
                    productId: product._id,
                    productName: product.name,
                    quantity,
                    price: product.price,
                    totalAmount
                }
            ],
            productStatus: 'placed',
            paymentCollected: false,
            paymentStatus: 'PENDING',
            shippingAddress: {
                address: address || "Kolkata",
                state
            },
            notes,
            productStatusHistory: [
                {
                    status: "placed",
                    updatedBy: userID
                }
            ]
        });
        // Update stock
        // product.stock -= quantity;
        // await product.save();

        return res.status(201).json({
            message: "Initial-Order placed successfully but payment not confirmed",
            order: product_Placed_Payment_Pending
        });

    } catch (error) {
        console.error("Error while placing order", error);
        return res.status(500).json({ message: "Something went wrong while placing the order", error });
    }
});

// step-2
// payment-status = PAID, product-status = placed
orderRouter.patch("/product-placed-payment-paid/:order_id", Authentication(["admin", "customer"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const order_id = req.params.order_id;

        if (!role || !specifiedRole.includes(role)) {
            return res.status(403).json({ message: "Only Admin or customer can place initial order status." });
        }

        const product_Placed_Payment_Paid = await OrderModel.findByIdAndUpdate(
            order_id,
            {
                $set: {
                    productStatus: "placed",
                    paymentStatus: "PAID",
                    paymentCollected: false,
                }
            },
            { new: true } // returns the updated document
        );
        console.log(product_Placed_Payment_Paid)
        return res.status(200).json({
            message: "Payment updated to PAID.", details: product_Placed_Payment_Paid
        });

    } catch (error) {
        console.error("Error while updating payment status", error);
        return res.status(500).json({
            message: "Something went wrong while updating payment and product status",
            error
        });
    }
});

// step-3
// payment-status = FULLFILLED, product-status = picked, add product-status to productStatusHistory also
orderRouter.patch("/product-picked-payment-fulfilled/:order_id", Authentication(["admin", "staff"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const order_id = req.params.order_id;

        if (!role || !["admin", "staff"].includes(role)) {
            return res.status(403).json({ message: "Only Admin or staff can update product-status(picked) and payment-status(fulfilled)." });
        }
        const existingOrder = await OrderModel.findById(order_id);
        if (!existingOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (existingOrder.productStatus === "picked") {
            return res.status(400).json({ message: "Order already marked as picked." });
        }
        for (const item of existingOrder.items) {
            const product = await ProductModel.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for product ${product.name}. Available: ${product.stock}, required: ${item.quantity}`
                });
            }

            product.stock -= item.quantity;
            await product.save();
        }
        const product_Picked_Payment_Fulfilled = await OrderModel.findByIdAndUpdate(
            order_id,
            {
                $set: {
                    productStatus: "picked",
                    paymentStatus: "FULFILLED",
                    paymentCollected: true,
                },
                $push: {
                    productStatusHistory: {
                        status: "picked",
                        updatedBy: userID
                    }
                }
            },
            { new: true } // returns the updated document
        );
        return res.status(200).json({
            message: "Payment confirmed (FULFILLED) and product marked as PICKED.", details: product_Picked_Payment_Fulfilled
        });

    } catch (error) {
        console.error("Error while updating payment status", error);
        return res.status(500).json({
            message: "Something went wrong while updating payment and product status",
            error
        });
    }
});

// step-4
// product-status = shipped, add product-status to productStatusHistory also
orderRouter.patch("/product-shipped-payment-fulfilled/:order_id", Authentication(["admin", "staff"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const order_id = req.params.order_id;

        if (!role || !["admin", "staff"].includes(role)) {
            return res.status(403).json({ message: "Only Admin or staff can update product-status(shipped)." });
        }
        const existingOrder = await OrderModel.findById(order_id);
        if (!existingOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (existingOrder.productStatus === "shipped") {
            return res.status(400).json({ message: "Order is already marked as shipped." });
        }

        const product_Shipped = await OrderModel.findByIdAndUpdate(
            { _id: order_id },
            {
                $set: {
                    productStatus: "shipped"
                },
                $push: {
                    productStatusHistory: {
                        status: "shipped",
                        updatedBy: userID
                    }
                }
            },
            { new: true } // returns the updated document
        );
        return res.status(200).json({
            message: "Product status updated to SHIPPED.", details: product_Shipped
        });

    } catch (error) {
        console.error("Error while updating product status to shipped", error);
        return res.status(500).json({
            message: "Something went wrong while updating product status",
            error
        });
    }
});


// cancel-order, payment_status: cancelled, product_status: cancelled, add product-status to productStatusHistory also and update the qunatity od product in product collection
orderRouter.patch("/cancel-order/:order_id/:product_id", Authentication(["customer", "admin"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const order_id = req.params.order_id;
        const product_id = req.params.product_id;

        if (!role || !["customer", "admin"].includes(role)) {
            return res.status(403).json({ message: "Only Admin or Customer can cancel the order." });
        }

        const isUser = await UserModel.findById(userID);
        if (!isUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const order = await OrderModel.findById(order_id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Find the item inside the order related to the given product_id
        const orderedItem = order.items.find(item => item.productId.toString() === product_id);
        if (!orderedItem) {
            return res.status(404).json({ message: "Product not found in the order" });
        }

        // Restore stock
        const product = await ProductModel.findById(product_id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.stock += orderedItem.quantity;
        await product.save();

        const cancel_Order = await OrderModel.findByIdAndUpdate(order_id,
            {
                $set: {
                    productStatus: "cancelled",
                    paymentStatus: "cancelled",
                    paymentCollected: false
                },
                $push: {
                    productStatusHistory: {
                        status: "cancelled",
                        updatedBy: userID
                    }
                }
            },
            { new: true }
        )

        return res.status(200).json({
            message: "Order cancelled, stock updated and payment refund to customer successfully",
            cancel_Order
        });

    } catch (error) {
        console.error("Error while cancelling order", error);
        return res.status(500).json({ message: "Error while cancelling order.", error });
    }
});


export { orderRouter }
