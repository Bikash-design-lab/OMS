"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation" // Import usePathname
import Link from "next/link"
import { getStoredUser, logout } from "@/lib/auth" // Assuming lib/auth.ts is in src/lib/

interface User {
    name: string
    email: string
    role: string
}

interface NavigationItem {
    name: string
    href: string
    current: boolean
}

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter()
    const pathname = usePathname() // Get the current pathname
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [navigation, setNavigation] = useState<NavigationItem[]>([])

    useEffect(() => {
        const currentUser = getStoredUser()
        if (!currentUser) {
            router.push("/register/signin") // Redirect to signin if not authenticated
            return
        }
        setUser(currentUser)

        // Define navigation based on user role
        let navItems: NavigationItem[] = []
        if (currentUser.role === "admin" || currentUser.role === "staff") {
            navItems = [
                { name: "Dashboard", href: "/dashboard/admin", current: pathname === "/dashboard/admin" }, // Use pathname
                { name: "Products", href: "/products", current: pathname === "/products" }, // Use pathname
                { name: "Orders", href: "/orders/manage", current: pathname === "/orders/manage" }, // Use pathname
            ]
        } else if (currentUser.role === "customer") {
            navItems = [
                { name: "Dashboard", href: "/dashboard/customer", current: pathname === "/dashboard/customer" }, // Use pathname
                { name: "Products", href: "/products", current: pathname === "/products" }, // Use pathname
                { name: "My Orders", href: "/orders/my-orders", current: pathname === "/orders/my-orders" }, // Use pathname
            ]
        }
        setNavigation(navItems)
    }, [pathname, router]) // Re-run effect if pathname changes

    const handleLogout = () => {
        logout() // Uses the logout function from lib/auth.ts
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-2xl font-extrabold text-gray-900">OMS</h1>
                            </div>
                            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                      ${item.current ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}
                      inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                    `}
                                        aria-current={item.current ? "page" : undefined}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-700">
                                        {user.name} ({user.role})
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="-mr-2 flex items-center sm:hidden">
                            {/* Mobile menu button */}
                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <span className="sr-only">Open main menu</span>
                                {/* Icon when menu is closed. */}
                                {!isMobileMenuOpen ? (
                                    <svg
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu, show/hide based on menu state. */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden" id="mobile-menu">
                        <div className="pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    ${item.current ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"}
                    block pl-3 pr-4 py-2 border-l-4 text-base font-medium
                  `}
                                    aria-current={item.current ? "page" : undefined}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <button
                                    onClick={handleLogout}
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Page content */}
            <main className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    )
}
