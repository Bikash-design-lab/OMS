"use client"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { getAuthHeaders, getStoredUser } from "@/lib/auth"
import { API_ENDPOINTS } from "@/lib/api"
import type { Order, ApiResponse, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const userData = getStoredUser()
        setUser(userData)
        if (userData && userData.role === "customer") {
            fetchMyOrders()
        } else {
            setError("You do not have permission to view this page.")
            setIsLoading(false)
        }
    }, [])

    const fetchMyOrders = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const headers = getAuthHeaders()
            // NOTE: This endpoint (ORDER_USER_ORDERS) is assumed and not provided in your backend documentation.
            // You would need to implement a GET /order/my-orders endpoint on your backend that returns orders for the authenticated user.
            const response = await fetch(API_ENDPOINTS.ORDER_USER_ORDERS, { headers })
            const data: ApiResponse<Order[]> = await response.json()

            if (response.ok) {
                setOrders(data.details || [])
            } else {
                setError(data.message || "Failed to fetch your orders.")
            }
        } catch (err) {
            console.error(err)
            setError("Network error. Could not fetch your orders.")
        } finally {
            setIsLoading(false)
        }
    }

    const cancelOrderItem = async (orderId: string, productId: string) => {
        if (!confirm("Are you sure you want to cancel this item in your order?")) return

        setIsLoading(true)
        setError(null)
        try {
            const headers = getAuthHeaders()
            const response = await fetch(API_ENDPOINTS.ORDER_CANCEL(orderId, productId), {
                method: "PATCH",
                headers,
            })
            const data: ApiResponse = await response.json()

            if (response.ok) {
                alert(data.message || "Order item cancelled successfully!")
                fetchMyOrders() // Refresh list
            } else {
                setError(data.message || "Failed to cancel order item.")
            }
        } catch (err) {
            console.error(err)
            setError("Network error. Could not cancel order item.")
        } finally {
            setIsLoading(false)
        }
    }

    const cancelEntireOrder = async (order: Order) => {
        if (!confirm("Are you sure you want to cancel this entire order? This will cancel all items.")) return

        setIsLoading(true)
        setError(null)
        try {
            const headers = getAuthHeaders()
            let allCanceled = true
            for (const item of order.items) {
                const response = await fetch(API_ENDPOINTS.ORDER_CANCEL(order._id, item.productId), {
                    method: "PATCH",
                    headers,
                })
                if (!response.ok) {
                    allCanceled = false
                    const data: ApiResponse = await response.json()
                    setError(data.message || `Failed to cancel item ${item.productName}.`)
                    break // Stop on first failure
                }
            }

            if (allCanceled) {
                alert("Entire order cancelled successfully!")
                fetchMyOrders() // Refresh list
            }
        } catch (err) {
            console.error(err)
            setError("Network error. Could not cancel order.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!user || user.role !== "customer") {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-red-600">You do not have permission to view this page.</div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="px-4 py-6 sm:px-0">
                <Card>
                    <CardHeader>
                        <CardTitle>My Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="p-6 text-center text-gray-500">Loading orders...</div>
                        ) : error ? (
                            <div className="p-6 text-center text-red-600">{error}</div>
                        ) : orders.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No orders found.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Product Status</TableHead>
                                        <TableHead>Payment Status</TableHead>
                                        <TableHead>Total Items</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order._id}>
                                            <TableCell className="font-medium">{order._id}</TableCell>
                                            <TableCell>{order.productStatus}</TableCell>
                                            <TableCell>{order.paymentStatus}</TableCell>
                                            <TableCell>{order.items.length}</TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/orders/${order._id}`}>View Details</Link>
                                                        </DropdownMenuItem>
                                                        {order.paymentStatus === "PENDING" && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    alert(
                                                                        "Simulating payment confirmation. Please ensure your backend handles actual payment processing.",
                                                                    )
                                                                    fetch(API_ENDPOINTS.ORDER_PAYMENT_PAID(order._id), {
                                                                        method: "PATCH",
                                                                        headers: getAuthHeaders(),
                                                                    })
                                                                        .then(async (res) => {
                                                                            const isOk = res.ok
                                                                            const data = await res.json()
                                                                            if (isOk) {
                                                                                alert(data.message || "Order marked as paid!")
                                                                                fetchMyOrders()
                                                                            } else {
                                                                                alert(data.message || "Failed to mark order as paid.")
                                                                            }
                                                                        })
                                                                        .catch(() => alert("Network error during payment confirmation."))

                                                                }}
                                                            >
                                                                Mark as Paid
                                                            </DropdownMenuItem>
                                                        )}
                                                        {order.productStatus !== "cancelled" && order.paymentStatus !== "CANCELLED" && (
                                                            <DropdownMenuItem onClick={() => cancelEntireOrder(order)}>Cancel Order</DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
