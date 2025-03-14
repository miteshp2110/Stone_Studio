"use client"

import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import { BarChart3, ShoppingBag, Users, DollarSign, Package, Tag, Loader2, PlusCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/navbar"
import { useAuth } from "@/lib/auth-context"
import { formatCurrency } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Footer from "@/components/footer"

interface Stats {
  total_revenue: number
  total_items_sold: number
  total_active_customers: number
  conversion_rate: string
}

interface Product {
  id: number
  name: string
  price: string
  status: string
  category_id: number
}

interface Category {
  id: number
  name: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [pageNumber,setPageNumber] = useState(1)

    // New admin form state
    const [newAdminEmail, setNewAdminEmail] = useState("")
    const [newAdminName, setNewAdminName] = useState("")
    const [newAdminPassword, setNewAdminPassword] = useState("")
    const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  
    // Change password form state
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isChangingPassword, setIsChangingPassword] = useState(false)


  useEffect(()=>{
    const fetchData = async () => {
      const productResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/products?page=${pageNumber}&lmit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (productResponse.ok) {
        const data = await productResponse.json()
        if(data.length>0){
          setProducts([...products,...data])
        }
        else{
          alert("No more products to load")
        }
      }
      else{
        console.error("Failed to load more products")
      }
    }
    fetchData()
  },[pageNumber])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch stats
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch products
        const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/products?limit=10`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
        }

        // Fetch categories
        const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])


  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAdminEmail || !newAdminName || !newAdminPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsAddingAdmin(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          role: "admin",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "New admin user has been added",
        })
        alert("New Admin Added")

        // Reset form
        setNewAdminEmail("")
        setNewAdminName("")
        setNewAdminPassword("")
      } else {
        throw new Error("Failed to add admin user")
      }
    } catch (error) {
      console.error("Error adding admin:", error)
      toast({
        title: "Error",
        description: "Failed to add admin user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      alert("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive",
      })
      alert("Password Mismatch")
      return
    }

    setIsChangingPassword(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        alert("Password Reset Successfull.")
        toast({
          title: "Success",
          description: "Your password has been updated",
        })

        // Reset form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        alert("Current Password is wrong")
        throw new Error("Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-accent" />
            <h2 className="text-2xl font-bold mb-2">Loading Dashboard</h2>
            <p className="text-muted-foreground">Please wait while we load your dashboard...</p>
          </div>
        </main>
      </>
    )
  }

 

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name}. Here's what's happening with your store today.
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button asChild>
                <Link href="/admin/products/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/categories/new">
                  <Tag className="mr-2 h-4 w-4" /> Add Category
                </Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats ? formatCurrency(stats.total_revenue) : formatCurrency(0)}</div>
                      {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats ? stats.total_items_sold : 0}</div>
                      {/* <p className="text-xs text-muted-foreground">+15% from last month</p> */}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats ? stats.total_active_customers : 0}</div>
                      {/* <p className="text-xs text-muted-foreground">+7% from last month</p> */}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats ? `${stats.conversion_rate}%` : "0%"}</div>
                      {/* <p className="text-xs text-muted-foreground">+4.3% from last month</p> */}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add New Admin */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" /> Add New Admin
                    </CardTitle>
                    <CardDescription>Create a new administrator account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddAdmin} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="admin-name">Name</label>
                        <Input
                          id="admin-name"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="admin-email">Email</label>
                        <Input
                          id="admin-email"
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="admin@example.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isAddingAdmin}>
                        {isAddingAdmin ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                          </>
                        ) : (
                          "Add Admin User"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {/* <Lock className="h-5 w-5" /> Change Password */}
                      Change Password
                    </CardTitle>
                    <CardDescription>Update your admin account password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Products</h2>
                <Button asChild>
                  <Link href="/admin/products/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                  </Link>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>
                    Manage your product inventory, update details, and add new products.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No products found</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't added any products yet. Start by adding your first product.
                      </p>
                      <Button asChild>
                        <Link href="/admin/products/new">
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Product
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">ID</th>
                            <th className="text-left py-3 px-2">Name</th>
                            <th className="text-left py-3 px-2">Price</th>
                            <th className="text-left py-3 px-2">Status</th>
                            <th className="text-left py-3 px-2">Category</th>
                            <th className="text-right py-3 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => {
                            const category = categories.find((c) => c.id === product.category_id)
                            return (
                              <tr key={product.id} className="border-b">
                                <td className="py-3 px-2">{product.id}</td>
                                <td className="py-3 px-2">{product.name}</td>
                                <td className="py-3 px-2">{formatCurrency(Number.parseFloat(product.price))}</td>
                                <td className="py-3 px-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      product.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {product.status}
                                  </span>
                                </td>
                                <td className="py-3 px-2">{category?.name || "Unknown"}</td>
                                <td className="py-3 px-2 text-right">
                                  <Button asChild variant="ghost" size="sm">
                                    <Link href={`/admin/products/${product.id}`}>Edit</Link>
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}

                        </tbody>
                      </table>
                      <div className="flex justify-center mt-6">
                        <Button onClick={()=>setPageNumber(pageNumber+1)}>Load More</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Categories</h2>
                <Button asChild>
                  <Link href="/admin/categories/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                  </Link>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Category Management</CardTitle>
                  <CardDescription>Manage your product categories to better organize your inventory.</CardDescription>
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <div className="text-center py-6">
                      <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No categories found</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't added any categories yet. Start by adding your first category.
                      </p>
                      <Button asChild>
                        <Link href="/admin/categories/new">
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Category
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">ID</th>
                            <th className="text-left py-3 px-2">Name</th>
                            
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id} className="border-b">
                              <td className="py-3 px-2">{category.id}</td>
                              <td className="py-3 px-2">{category.name}</td>
                              <td className="py-3 px-2 text-right">
                                
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {/* <TabsContent value="settings" className="space-y-6">
              
            </TabsContent> */}
          </Tabs>
        </div>
      </main>
      <Footer/>
    </>
  )
}

