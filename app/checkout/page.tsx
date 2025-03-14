"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { formatCurrency, getImageUrl } from "@/lib/utils"

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart()
  const { user, getToken } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + Number.parseFloat(item.price) * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  useEffect(() => {
    // Redirect to products if cart is empty
    if (cartItems.length === 0 && !isProcessing) {
      router.push("/products")
    }
  }, [cartItems, router, isProcessing])

  const handleCheckout = async () => {
    if (!user) {
      // Redirect to Google OAuth login
      setIsRedirecting(true)
      localStorage.setItem("redirectAfterLogin", "/checkout")
      window.location.href = "/auth/google"
      return
    }

    setIsProcessing(true)

    try {
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const data = await response.json()
        clearCart()
        router.push("/settings")
      } else {
        throw new Error("Checkout failed")
      }
    } catch (error) {
      console.error("Checkout error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isRedirecting) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-accent" />
            <h2 className="text-2xl font-bold mb-2">Redirecting to Login</h2>
            <p className="text-muted-foreground">Please wait while we redirect you to sign in...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button asChild variant="ghost" className="flex items-center gap-2">
              <a href="javascript:history.back()">
                <ArrowLeft className="h-4 w-4" /> Back
              </a>
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 py-2">
                      <div className="w-20 h-20 relative rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={getImageUrl(item.image_urls) || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(Number.parseFloat(item.price))} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(Number.parseFloat(item.price) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" /> Payment
                </h2>

                {!user ? (
                  <div className="text-center py-6">
                    <p className="mb-4">Please sign in to complete your purchase</p>
                    <Button onClick={handleCheckout} className="w-full">
                      Sign in with Google
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={user.name} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user.email} readOnly />
                    </div> */}

                    <Button onClick={handleCheckout} className="w-full" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        "Complete Purchase"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

