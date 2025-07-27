import express, { Response, Request, Router } from "express";
import { ObjectId } from 'mongoose';

interface AuthRequest extends Request {
    userID?: ObjectId;
    role?: 'admin' | 'staff' | 'customer';
}


import ProductModel from "../Models/product.models";
const productRouter: Router = express.Router()
import { Authentication } from '../Middlewares/auth.middleware';
import UserModel from "../Models/user.models";

// testing endpoint
productRouter.get("/test", (req: Request, res: Response) => {
    res.json({ message: 'This is healthy test by product.' })
});


let specifiedRole = ["admin", "staff"]
productRouter.post("/list-product", Authentication(["admin", "staff"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        if (!role || !specifiedRole.includes(role)) {
            return res.status(403).json({ message: "Either Admin or Staff can list product." });
        }
        const isUser = await UserModel.findById(userID)
        if (!isUser) {
            return res.status(404).json({ message: "User not found" })
        }
        const product = await ProductModel.create({ ...req.body })
        res.status(200).json({ message: "Product listed on OMS sucessfully.", details: product })
    } catch (error) {
        console.log("Error while listing new product.")
        res.status(500).json({ message: "Something went wrong", error })
    }
})


productRouter.get("/all-products", Authentication(["admin", "staff"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        if (!role || !specifiedRole.includes(role)) {
            return res.status(403).json({ message: "Either Admin or Staff can list product." });
        }
        const isUser = await UserModel.findById(userID)
        if (!isUser) {
            return res.status(404).json({ message: "User not found" })
        }
        const product = await ProductModel.find()
        res.status(200).json({ message: "All listed Products on OMS.", details: product })
    } catch (error) {
        console.log("Error while acessing products.")
        res.status(500).json({ message: "Something went wrong", error })
    }
})


productRouter.patch("/update_details/:product_id", Authentication(["admin", "staff"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const product_id = req.params.product_id;
        if (!role || !specifiedRole.includes(role)) {
            return res.status(403).json({ message: "Either Admin or Staff can list product." });
        }
        const isUser = await UserModel.findById(userID)
        if (!isUser) {
            return res.status(404).json({ message: "User not found" })
        }
        const updatedProduct = await ProductModel.findByIdAndUpdate(product_id, { ...req.body }, { new: true })
        return res.status(200).json({ message: "Product updated successfully.", details: updatedProduct });
    }
    catch (error) {
        console.log("Error while updating product:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
}
);

productRouter.delete("/remove_product/:product_id", Authentication(["admin", "staff"]), async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const product_id = req.params.product_id;
        if (!role || !specifiedRole.includes(role)) {
            return res.status(403).json({ message: "Either Admin or Staff can list product." });
        }
        const isUser = await UserModel.findById(userID)
        if (!isUser) {
            return res.status(404).json({ message: "User not found" })
        }
        const removeProduct = await ProductModel.findByIdAndDelete({ _id: product_id })
        return res.status(200).json({ message: "Product removed from platform successfully.", details: removeProduct });
    }
    catch (error) {
        console.log("Error while removing product:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
}
);

export { productRouter }
