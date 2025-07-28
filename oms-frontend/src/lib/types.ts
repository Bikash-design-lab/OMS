export interface User {
    _id: string
    name: string
    email: string
    role: "admin" | "staff" | "customer"
    createdAt: string
    updatedAt: string
}

export interface Product {
    _id: string
    name: string
    description: string
    price: number
    stock: number
    category?: string
    user_id?: string // Add this line
    createdAt: string
    updatedAt: string
}

export interface OrderItem {
    productId: string
    productName: string
    quantity: number
    price: number
    totalAmount: number
}

export interface StatusHistory {
    status: "placed" | "picked" | "shipped" | "cancelled"
    timestamp: string
    updatedBy: string
}

export interface Order {
    _id: string
    customerId: string
    items: OrderItem[]
    productStatus: "placed" | "picked" | "shipped" | "cancelled"
    paymentCollected: boolean
    paymentStatus: "PENDING" | "PAID" | "FULFILLED" | "CANCELLED"
    shippingAddress: {
        address: string
        state: string
    }
    notes?: string
    productStatusHistory: StatusHistory[]
    createdAt: string
    updatedAt: Date
}

export interface ApiResponse<T = unknown> {
    message: string
    user?: User
    token?: string
    details?: T
    order?: Order
}

