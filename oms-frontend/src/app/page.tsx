"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStoredUser } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      // Redirect authenticated users to their dashboard
      const dashboardPath = user.role === "customer" ? "/dashboard/customer" : "/dashboard/admin"
      router.push(dashboardPath)
    }
    // If not authenticated, stay on this public home page
  }, [router])

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Welcome to OMS</h1>
        <p className="text-xl text-gray-600 mb-8">Your ultimate solution for Order Management.</p>
        <div className="space-x-4">
          <Link
            href="/register/signup"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Get Started
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}


// import Image from "next/image";

// export default function Home() {
//   return (
//     <div>
//       <h1 className="text-center text-2xl font-bold">This is my first nextjs application.</h1>
//     </div>
//   );
// }


