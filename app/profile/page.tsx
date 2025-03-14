"use client"

import { useAuth } from "../../lib/auth-context"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"

// Mock data for orders - In a real app, this would come from your backend
const mockOrders = [
  {
    id: 1,
    date: new Date("2024-02-20"),
    items: [
      {
        id: 1,
        name: "Premium Template",
        price: 999,
        quantity: 2,
        image: "/placeholder.svg?height=400&width=400",
      },
      {
        id: 2,
        name: "3D Model Collection",
        price: 1999,
        quantity: 1,
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    total: 3997,
    status: "Delivered",
  },
  {
    id: 2,
    date: new Date("2024-02-15"),
    items: [
      {
        id: 3,
        name: "Icon Pack",
        price: 499,
        quantity: 1,
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    total: 499,
    status: "Delivered",
  },
]

export default function ProfilePage() {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)
  interface Order {
    id: number
    date: Date
    items: {
      id: number
      name: string
      price: number
      quantity: number
      image: string
    }[]
    total: number
    status: string
  }

  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [createDate, setCreateDate] = useState("")

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setEmail(data.email)
          setName(data.name)
          setCreateDate(data.created_at)
        } else {
          console.error("Server is not responding")
        }
      } catch (e) {
        console.error("Server is not responding")
      } finally {
        setLoading(false)
      }
    }
    getProfile()
  }, [])

  useEffect(() => {
    setLoading(true)
    const getHistory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/orders/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setOrderHistory(data)
        } else {
          console.error("Server is not responding")
        }
      } catch (e) {
        console.error("Server is not responding")
      }
    }
    getHistory()
    setLoading(false)
  }, [])
  const session = {
    user: {
      name: "Name",
      email: "someemail@email",
      image: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 md:px-8 lg:m-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg" />
                <AvatarFallback>{"U"}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{name}</h1>
                <p className="text-muted-foreground">{email}</p>
              </div>
              <br />

              <Button
                onClick={() => {
                  logout()
                }}
                className="mt-4 sm:mt-0 sm:ml-auto bg-red-500 hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </Button>
            </div>

            {/* Profile Content */}
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="settings">Account Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-6">
                {orderHistory.length === 0 ? (
                  <>
                    {" "}
                    <div>No Orders Found</div>
                  </>
                ) : (
                  orderHistory.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                          <div>
                            <CardTitle>Order #{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">{format(order.date, "PPP")}</p>
                          </div>
                          <div className="text-left sm:text-right mt-2 sm:mt-0">
                            <p className="font-medium">₹{order.total}</p>
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-lg bg-muted/50"
                            >
                              <div className="relative w-16 h-16 flex-shrink-0">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                              </div>
                              <div className="mt-2 sm:mt-0 w-full sm:w-auto text-left sm:text-right">
                                <p className="font-medium">₹{item.price}</p>
                                <p className="text-sm text-muted-foreground">Total: ₹{item.price * item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="mt-1">{name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="mt-1">{email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                      <p className="mt-1">
                        {createDate.split("T")[0]} {/* Replace with actual date */}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}

