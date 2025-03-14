"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleGoogleLogin = () => {
    // Store the current path to redirect back after login
    localStorage.setItem("redirectAfterLogin", "/")
    // Redirect to Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-40">
                <Image
                  src="/placeholder.svg?height=200&width=600"
                  alt="Login"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end">
                  <h1 className="text-white text-2xl font-bold p-6">Welcome Back</h1>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-muted-foreground mb-6 text-center">
                  Sign in to access your account, view your order history, and more.
                </p>
                
                <div className="space-y-4">
                  <Button 
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>
                    Sign in with Google
                  </Button>

                  <Button 
                    onClick={() => router.push("/admin/login")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Admin Login
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
