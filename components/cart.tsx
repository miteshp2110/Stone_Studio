"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"

interface CartProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function Cart({ isOpen, setIsOpen }: CartProps) {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart()

  const totalPrice = cartItems.reduce((total, item) => total + Number.parseFloat(item.price) * item.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Cart panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-white z-50 shadow-xl flex flex-col"

            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-playfair font-semibold">Your Cart</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
                <Button onClick={() => setIsOpen(false)}>Continue Shopping</Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-4 py-2 border-b pb-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image_urls[0] || "/placeholder.svg?height=80&width=80"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{formatCurrency(Number.parseFloat(item.price))}</p>
                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right ml-auto">
                        <p className="font-medium">{formatCurrency(Number.parseFloat(item.price) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t bg-white">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(totalPrice)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between py-2 font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="mt-4 space-y-2 pb-4">
                    <Link href="/checkout" onClick={() => setIsOpen(false)} >
                      <Button className="w-full">Checkout</Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={() => clearCart()}>
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

