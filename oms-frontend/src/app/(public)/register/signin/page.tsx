"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api"
import type { ApiResponse } from "@/lib/types"

interface SigninFormData {
    email: string
    password: string
}

export default function SigninPage() {
    const [formData, setFormData] = useState<SigninFormData>({
        email: "",
        password: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (error) setError(null)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(API_ENDPOINTS.USER_SIGNIN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data: ApiResponse = await response.json()

            if (response.ok && data.user && data.token) {
                // Store user data and token
                localStorage.setItem("userData", JSON.stringify(data.user))
                localStorage.setItem("authToken", data.token)

                // Redirect based on role
                const redirectPath = data.user.role === "customer" ? "/dashboard/customer" : "/dashboard/admin"
                window.location.href = redirectPath
            } else {
                setError(data.message || "Invalid credentials")
            }
        } catch (err) {
            setError(`Network error. Please try again, ${err}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                <p className="mt-2 text-center text-sm text-gray-600">Access your Order Management System</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-sm text-gray-600">
                                Don&#39;t have an account?{" "}
                                <Link href="/register/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Sign up
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
