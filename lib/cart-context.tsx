"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"


export interface CartItem {
  id: number
  name: string
  price: string
  image_urls: string
  quantity: number
  product_id?: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: CartItem) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)


export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user, getToken } = useAuth()

 

  // Load cart from localStorage or API
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)

      if (user) {
        // If user is logged in, fetch cart from API
        try {
          const token = getToken()
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/cart`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            // console.log("Loading cart from api ")
            const data = await response.json()
            setCartItems(
              data.map((item: any) => ({
                id: item.product_id,
                name: item.name,
                price: item.price,
                image_urls: item.image_urls || "[]",
                quantity: item.quantity,
              })),
            )
          }
        } catch (error) {
          console.error("Failed to load cart", error)
          // Fall back to localStorage
          const savedCart = localStorage.getItem("cart")
          if (savedCart) {
            setCartItems(JSON.parse(savedCart))
          }
        }
      } else {
        // If not logged in, use localStorage
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        }
      }

      setIsLoading(false)
    }

    loadCart()
  }, [user, getToken])

 
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
      const cartSet = new Set(cartItems.map((item) => item.id))
      localStorage.setItem("cartSet", JSON.stringify(Array.from(cartSet)))

    }
  }, [cartItems, isLoading])

  

  const addToCart = async (product: CartItem) => {

    

    if(!user){
      alert("Login to user cart facility")
      window.location.href = "/login"  
      return
    }

    // console.log("Calling add to cart")
    // Check if product is already in cart
    const existingItem = cartItems.find((item) => item.id === product.id)

    let updatedCart: CartItem[]

    if (existingItem) {
      // Increase quantity if product already exists
      // console.log("existingItem", existingItem)
      updatedCart = cartItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      // console.log("updatedCart", updatedCart)
    } else {
      // Add new product with quantity 1
      // console.log("product", product)
      updatedCart = [...cartItems, { ...product, quantity: 1 }]
    }

    setCartItems(updatedCart)

    // If user is logged in, sync with API
    if (user) {
      try {
        // console.log("Send api request to update quantity to : ",existingItem?.quantity)
        const token = getToken()
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: existingItem ? existingItem.quantity  : 1,
          }),
        })
      } catch (error) {
        console.error("Failed to update cart on server", error)
      }
    }

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const removeFromCart = async (productId: number) => {
    const existingItem = cartItems.find((item) => item.id === productId)

    if (!existingItem) return

    let updatedCart: CartItem[]

    if (existingItem.quantity > 1) {
      // Decrease quantity
      updatedCart = cartItems.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
    } else {
      // Remove item completely
      updatedCart = cartItems.filter((item) => item.id !== productId)
    }

    setCartItems(updatedCart)

    // If user is logged in, sync with API
    if (user) {
      try {
        const token = getToken()
        if (existingItem.quantity) {
          await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/cart/quantity`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_id: productId,
              action : "decrease" ,
            }),
          })
        } 
      } catch (error) {
        console.error("Failed to update cart on server", error)
      }
    }
  }

  const clearCart = async () => {
    setCartItems([])

    // If user is logged in, clear cart on server
    if (user) {
      try {
        const token = getToken()
        // API endpoint for clearing cart would be needed here
        // This is a simplified version
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/cart`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error("Failed to clear cart on server", error)
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

