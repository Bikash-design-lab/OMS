"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { getAuthHeaders, getStoredUser } from "@/lib/auth"
import { API_ENDPOINTS } from "@/lib/api"
import type { Order, ApiResponse, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

export default function OrderDetailsPage() {
    const { orderId } = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const userData = getStoredUser()
        setUser(userData)
        if (orderId && userData) {
            fetchOrderDetails(orderId as string)
        } else {
            setError("Order ID not provided or user not authenticated.")
            setIsLoading(false)
        }
    }, [orderId])

    const fetchOrderDetails = async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const headers = getAuthHeaders()
            // NOTE: This endpoint (ORDER_BY_ID) is assumed and not provided in your backend documentation.
            // You would need to implement a GET /order/:order_id endpoint on your backend.
            const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(id), { headers })
            const data: ApiResponse<Order> = await response.json()

            if (response.ok && data.order) {
                setOrder(data.order)
            } else {
                setError(data.message || "Failed to fetch order details.")
            }
        } catch (err) {
            setError("Network error. Could not fetch order details.")
        } finally {
            setIsLoading(false)
        }
    }

    const updateOrderStatus = async (statusType: "picked" | "shipped" | "paid") => {
        if (!order) return

        setIsLoading(true)
        setError(null)
        try {
            const headers = getAuthHeaders()
            let endpoint: string
            const method = "PATCH"

            if (statusType === "picked") {
                endpoint = API_ENDPOINTS.ORDER_PICKED(order._id)
            } else if (statusType === "shipped") {
                endpoint = API_ENDPOINTS.ORDER_SHIPPED(order._id)
            } else if (statusType === "paid") {
                endpoint = API_ENDPOINTS.ORDER_PAYMENT_PAID(order._id)
            } else {
                throw new Error("Invalid status type")
            }

            const response = await fetch(endpoint, {
                method,
                headers,
            })
            const data: ApiResponse = await response.json()

            if (response.ok) {
                alert(data.message || `Order status updated to ${statusType.toUpperCase()}!`)
                fetchOrderDetails(order._id) // Refresh details
            } else {
                setError(data.message || `Failed to update order status to ${statusType}.`)
            }
        } catch (err) {
            setError("Network error. Could not update order status.")
        } finally {
            setIsLoading(false)
        }
    }

    const cancelOrderItem = async (productId: string) => {
        if (!order) return
        if (!confirm("Are you sure you want to cancel this specific item in the order?")) return

        setIsLoading(true)
        setError(null)
        try {
            const headers = getAuthHeaders()
            const response = await fetch(API_ENDPOINTS.ORDER_CANCEL(order._id, productId), {
                method: "PATCH",
                headers,
            })
            const data: ApiResponse = await response.json()

            if (response.ok) {
                alert(data.message || "Order item cancelled successfully!")
                fetchOrderDetails(order._id) // Refresh details
            } else {
                setError(data.message || "Failed to cancel order item.")
            }
        } catch (err) {
            setError("Network error. Could not cancel order item.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-gray-500">Loading order details...</div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-red-600">{error}</div>
            </DashboardLayout>
        )
    }

    if (!order) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-gray-500">Order not found.</div>
            </DashboardLayout>
        )
    }

    const isAdminOrStaff = user && (user.role === "admin" || user.role === "staff")
    const isCustomer = user && user.role === "customer"

    const totalOrderAmount = order.items.reduce((sum, item) => sum + item.totalAmount, 0)

    return (
        <DashboardLayout>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="font-semibold text-lg md:text-xl">
                    Order #{order._id}
                    <span className="font-normal text-muted-foreground">
                        {" "}
                        on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products in Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price per unit</TableHead>
                                        <TableHead>Total</TableHead>
                                        {(isAdminOrStaff || isCustomer) && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.productId}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>${item.price.toFixed(2)}</TableCell>
                                            <TableCell>${item.totalAmount.toFixed(2)}</TableCell>
                                            {(isAdminOrStaff || isCustomer) && (
                                                <TableCell className="text-right">
                                                    {order.productStatus !== "cancelled" && order.paymentStatus !== "CANCELLED" && (
                                                        <Button variant="destructive" size="sm" onClick={() => cancelOrderItem(item.productId)}>
                                                            Cancel Item
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center">
                                <div>Subtotal</div>
                                <div className="ml-auto">${totalOrderAmount.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center">
                                <div>Shipping</div>
                                <div className="ml-auto">$0.00</div> {/* Assuming free shipping for now */}
                            </div>
                            <Separator />
                            <div className="flex items-center font-medium">
                                <div>Total</div>
                                <div className="ml-auto">${totalOrderAmount.toFixed(2)}</div>
                            </div>
                        </CardContent>
                        {(isAdminOrStaff || isCustomer) && (
                            <CardContent className="flex items-center gap-2">
                                {order.paymentStatus === "PENDING" && (
                                    <Button size="sm" onClick={() => updateOrderStatus("paid")}>
                                        Mark as Paid
                                    </Button>
                                )}
                                {isAdminOrStaff && order.productStatus === "placed" && (
                                    <Button size="sm" onClick={() => updateOrderStatus("picked")}>
                                        Mark as Picked
                                    </Button>
                                )}
                                {isAdminOrStaff && order.productStatus === "picked" && (
                                    <Button size="sm" onClick={() => updateOrderStatus("shipped")}>
                                        Mark as Shipped
                                    </Button>
                                )}
                            </CardContent>
                        )}
                    </Card>
                </div>

                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <span>Product Status:</span>
                                <Badge variant="outline">{order.productStatus.toUpperCase()}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Payment Status:</span>
                                <Badge variant="outline">{order.paymentStatus.toUpperCase()}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Payment Collected:</span>
                                <Badge variant="outline">{order.paymentCollected ? "YES" : "NO"}</Badge>
                            </div>
                        </CardContent>
                        <Separator />
                        <CardHeader>
                            <CardTitle>Status History</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            {order.productStatusHistory.map((history, index) => (
                                <div key={index} className="flex justify-between">
                                    <span>{history.status.toUpperCase()}</span>
                                    <span className="text-muted-foreground">{new Date(history.timestamp).toLocaleString()}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div>
                                {order.shippingAddress.address}
                                <br />
                                {order.shippingAddress.state}
                            </div>
                        </CardContent>
                    </Card>

                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p>{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
