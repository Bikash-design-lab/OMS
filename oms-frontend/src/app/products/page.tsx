"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { getAuthHeaders, getStoredUser } from "@/lib/auth"
import { API_ENDPOINTS } from "@/lib/api"
import type { Product, ApiResponse, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)

    // State for Add/Edit Product Modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
    const [formProduct, setFormProduct] = useState({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
    })
    const [formError, setFormError] = useState<string | null>(null)
    const [isFormLoading, setIsFormLoading] = useState(false)

    useEffect(() => {
        const userData = getStoredUser()
        setUser(userData)
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const headers = getAuthHeaders()
            const response = await fetch(API_ENDPOINTS.PRODUCT_ALL, { headers })
            const data: ApiResponse<Product[]> = await response.json()
            if (response.ok) {
                setProducts(data.details || [])
            } else {
                setError(data.message || "Failed to fetch products.")
            }
        } catch (err) {
            setError("Network error. Could not fetch products.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddProductClick = () => {
        setCurrentProduct(null)
        setFormProduct({ name: "", description: "", price: 0, stock: 0, category: "" })
        setFormError(null)
        setIsModalOpen(true)
    }

    const handleEditProductClick = (product: Product) => {
        setCurrentProduct(product)
        setFormProduct({
            name: product.name,
            description: product.description || "",
            price: product.price,
            stock: product.stock,
            category: product.category || "",
        })
        setFormError(null)
        setIsModalOpen(true)
    }

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return

        setIsLoading(true)
        setError(null)
        try {
            const headers = getAuthHeaders()
            const response = await fetch(API_ENDPOINTS.PRODUCT_DELETE(productId), {
                method: "DELETE",
                headers,
            })
            const data: ApiResponse = await response.json()
            if (response.ok) {
                alert(data.message || "Product deleted successfully!")
                fetchProducts() // Refresh list
            } else {
                setError(data.message || "Failed to delete product.")
            }
        } catch (err) {
            setError("Network error. Could not delete product.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormProduct((prev) => ({
            ...prev,
            [name]: name === "price" || name === "stock" ? Number(value) : value,
        }))
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsFormLoading(true)
        setFormError(null)
        try {
            const headers = getAuthHeaders()
            let response: Response
            let data: ApiResponse

            if (currentProduct) {
                // Update product
                response = await fetch(API_ENDPOINTS.PRODUCT_UPDATE(currentProduct._id), {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify(formProduct),
                })
            } else {
                // Add new product
                if (!user?._id) {
                    setFormError("User ID not found. Please log in again.")
                    setIsFormLoading(false)
                    return
                }
                response = await fetch(API_ENDPOINTS.PRODUCT_LIST, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ ...formProduct, user_id: user._id }), // Add user_id here
                })
            }

            data = await response.json()

            if (response.ok) {
                alert(data.message || "Product saved successfully!")
                setIsModalOpen(false)
                fetchProducts() // Refresh list
            } else {
                setFormError(data.message || "Failed to save product.")
            }
        } catch (err) {
            setFormError("Network error. Could not save product.")
        } finally {
            setIsFormLoading(false)
        }
    }

    const isAdminOrStaff = user && (user.role === "admin" || user.role === "staff")

    return (
        <DashboardLayout>
            <div className="px-4 py-6 sm:px-0">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>{isAdminOrStaff ? "Manage Products" : "Browse Products"}</CardTitle>
                        {isAdminOrStaff && (
                            <Button onClick={handleAddProductClick}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Product
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="p-6 text-center text-gray-500">Loading products...</div>
                        ) : error ? (
                            <div className="p-6 text-center text-red-600">{error}</div>
                        ) : products.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No products found.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Category</TableHead>
                                        {isAdminOrStaff && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product._id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.description}</TableCell>
                                            <TableCell>₹{product.price.toFixed(2)}</TableCell>
                                            <TableCell>{product.stock}</TableCell>
                                            <TableCell>{product.category || "N/A"}</TableCell>
                                            {isAdminOrStaff && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEditProductClick(product)}>
                                                            <Edit className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product._id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Product Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                            {currentProduct ? "Make changes to your product here." : "Add a new product to your inventory."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                        {formError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{formError}</div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formProduct.name}
                                onChange={handleFormChange}
                                required
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formProduct.description}
                                onChange={handleFormChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                value={formProduct.price}
                                onChange={handleFormChange}
                                required
                                min="0"
                                step="0.01"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                value={formProduct.stock}
                                onChange={handleFormChange}
                                required
                                min="0"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Input
                                id="category"
                                name="category"
                                type="text"
                                value={formProduct.category}
                                onChange={handleFormChange}
                                className="col-span-3"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isFormLoading}>
                                {isFormLoading ? "Saving..." : "Save Product"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
