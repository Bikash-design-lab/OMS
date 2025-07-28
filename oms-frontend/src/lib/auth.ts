import type { User } from "./types"

export const getStoredUser = (): User | null => {
    if (typeof window === "undefined") return null

    try {
        const userData = localStorage.getItem("userData")
        return userData ? JSON.parse(userData) : null
    } catch {
        return null
    }
}

export const getStoredToken = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("authToken")
}

export const isAuthenticated = (): boolean => {
    return !!(getStoredUser() && getStoredToken())
}

export const logout = (): void => {
    if (typeof window === "undefined") return

    localStorage.removeItem("userData")
    localStorage.removeItem("authToken")
    window.location.href = "/register/signin"
}

export const getAuthHeaders = () => {
    const token = getStoredToken()
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}
