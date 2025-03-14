"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { set } from "date-fns"

interface User {
  id: number
  name: string
  email: string
  role: "user" | "admin"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  login: (token: string) => void
  adminLogin: (email: string, password: string) => Promise<boolean>
  logout: () => void
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  async function verifyToken(token: string) {
    console.log("verifying token")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })  
      if(!response.ok) {
        console.error("Issnvalid token")
      localStorage.removeItem("token")
      localStorage.setItem("cart", "[]")
        localStorage.setItem("cartSet", "[]")
      localStorage.removeItem("redirectAfterLogin")
      window.location.href = "/"
      setUser(null)
      }
    
    }
    catch (error) { 
      console.error("Issnvalid token", error)
      localStorage.removeItem("token")
      localStorage.setItem("cart", "[]")
        localStorage.setItem("cartSet", "[]")
      localStorage.removeItem("redirectAfterLogin")
      window.location.href = "/"
      setUser(null)
    }
  }

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (token) {
      // console.log("Token found")
      // Decode JWT to get user info
      try {
        
        // console.log(token)
        const payload = JSON.parse(atob(token.split(".")[1]))
        
        verifyToken(token)
        
        setUser({
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        })
      } catch (error) {
        console.log("Invalid token")
        console.error("Invalid token", error)
        localStorage.setItem("cart", "[]")
        localStorage.setItem("cartSet", "[]")
        localStorage.removeItem("token")
      localStorage.removeItem("redirectAfterLogin")
      window.location.href = "/"
      setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  

  // Protect admin routes
  useEffect(() => {
    if (!isLoading && pathname?.startsWith("/admin") && pathname !== "/admin/login") {
      if (!user || user.role !== "admin") {
        router.push("/admin/login")
      }
    }
  }, [user, isLoading, pathname, router])

  useEffect(() => {
    if (!isLoading && pathname?.startsWith("/profile") ) {
      if(!user ){
        router.push("/login")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = (token: string) => {
    localStorage.setItem("token", token)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setUser({
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      })

      if (payload.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Invalid token", error)
      toast({
        title: "Authentication Error",
        description: "Invalid authentication token",
        variant: "destructive",
      })
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      login(data.token)
      return true
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("cart")
    localStorage.removeItem("cartSet")
    localStorage.removeItem("redirectAfterLogin")
    setUser(null)
    // router.push("/")
    window.location.href = "/"
  }

  const getToken = () => {
    return localStorage.getItem("token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "admin" || false,
        login,
        adminLogin,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

