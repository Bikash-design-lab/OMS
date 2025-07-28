"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoredUser, logout } from "@/lib/auth"
import type { User } from "@/lib/types"

const Navbar = () => {
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        setUser(getStoredUser())
    }, [])

    const linkClasses = (path: string) =>
        `relative pb-1 transition-colors duration-200 ${pathname === path
            ? "text-blue-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-400"
            : "text-white hover:text-blue-300"
        }`

    return (
        <nav className="bg-gray-800 text-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-3 sm:gap-0">
            {/* Logo */}
            <Link href="/" className="text-2xl sm:text-3xl font-semibold cursor-pointer text-blue-300">
                O<sup className="text-amber-200">MS</sup>
            </Link>
            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 text-base">
                <Link href="/" className={linkClasses("/")}>
                    Home
                </Link>
                <Link href="/products" className={linkClasses("/products")}>
                    Products
                </Link>
                <Link href="/about" className={linkClasses("/about")}>
                    About
                </Link>
                {!user ? (
                    <>
                        <Link href="/register/signup" className={linkClasses("/register/signup")}>
                            Sign Up
                        </Link>
                        <Link href="/register/signin" className={linkClasses("/register/signin")}>
                            Sign In
                        </Link>
                    </>
                ) : (
                    <button onClick={logout} className="text-white hover:text-blue-300 transition-colors duration-200">
                        Logout ({user.name})
                    </button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
