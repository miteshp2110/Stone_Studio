"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, X, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/navbar"
import { useAuth } from "@/lib/auth-context"
import RichTextEditor from "@/components/RichTextEditor"

interface Product {
  id: number
  name: string
  description: string
  price: string
  category_id: number
  status: string
  image_urls: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState("active")
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { getToken } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Fetch product and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingProduct(true)
      try {
        // Fetch product
        const productResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/products?id=${params.id}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        })

        if (productResponse.ok) {
          const data = await productResponse.json()
          // Find the product with the matching ID
          const foundProduct = Array.isArray(data)
            ? data.find((p: Product) => p.id === Number.parseInt(params.id))
            : data

          if (foundProduct) {
            setProduct(foundProduct)
            setName(foundProduct.name)
            setDescription(foundProduct.description)
            setPrice(foundProduct.price)
            setCategoryId(foundProduct.category_id.toString())
            setStatus(foundProduct.status)

            // Parse image URLs
            try {
              const imageUrls = foundProduct.image_urls
              setExistingImages(Array.isArray(imageUrls) ? imageUrls : [])
            } catch (error) {
              console.error("Failed to parse image URLs", error)
              setExistingImages([])
            }
          }
        }

        // Fetch categories
        const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/categories`)
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Failed to fetch data", error)
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProduct(false)
      }
    }

    fetchData()
  }, [params.id, getToken, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const files = e.target.files
    if (!files) return

    // Limit to 4 images total (existing + new)
    const remainingSlots = 4 - (existingImages.length + newImages.length)
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: "You can only have up to 4 images per product",
        variant: "destructive",
      })
      return
    }

    const newFiles: File[] = []
    const newPreviewUrls: string[] = []

    // Process only up to the remaining slots
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]

      // Validate file type
      if (!file.type.match("image.*")) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files",
          variant: "destructive",
        })
        continue
      }

      newFiles.push(file)
      newPreviewUrls.push(URL.createObjectURL(file))
    }

    setNewImages([...newImages, ...newFiles])
    setNewImagePreviewUrls([...newImagePreviewUrls, ...newPreviewUrls])

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeExistingImage = (index: number) => {
    const newExistingImages = [...existingImages]
    newExistingImages.splice(index, 1)
    setExistingImages(newExistingImages)
  }

  const removeNewImage = (index: number) => {
    const newFiles = [...newImages]
    const newPreviewUrls = [...newImagePreviewUrls]

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index])

    newFiles.splice(index, 1)
    newPreviewUrls.splice(index, 1)

    setNewImages(newFiles)
    setNewImagePreviewUrls(newPreviewUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (existingImages.length === 0 && newImages.length === 0) {
      toast({
        title: "No images",
        description: "Please include at least one product image",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const token = getToken()

      // Create FormData to handle file uploads
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category_id", categoryId)
      formData.append("status", status)

      // Append existing image URLs as JSON
      formData.append("existing_image_urls", JSON.stringify(existingImages))

      // Append each new image file
      let imgs:any = []
      newImages.forEach((image, index) => {
        formData.append(`images`, image)
        imgs.push(image)
      })
      // console.log(imgs)
      // formData.append("images", imgs)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/product/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type": "application/json"
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Product Updated",
          description: "Your product has been updated successfully",
        })
        router.push("/admin")
      } else {
        throw new Error("Failed to update product")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProduct) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-accent" />
            <h2 className="text-2xl font-bold mb-2">Loading Product</h2>
            <p className="text-muted-foreground">Please wait while we load the product data...</p>
          </div>
        </main>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
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
          <div className="mb-6">
            <Button asChild variant="ghost" className="flex items-center gap-2">
              <a href="javascript:history.back()">
                <ArrowLeft className="h-4 w-4" /> Back
              </a>
            </Button>
          </div>

          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <RichTextEditor value={description} onChange={setDescription} />
                  <h3>Preview:</h3>
                  <div
                    className="ql-editor"
                    style={{ border: "1px solid #ddd", padding: "10px", minHeight: "100px" }}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Images (Max 4)</Label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {/* Existing image previews */}
                    {existingImages.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative aspect-square rounded-md overflow-hidden border"
                      >
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {/* New image previews */}
                    {newImagePreviewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative aspect-square rounded-md overflow-hidden border">
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`New product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {/* Add image button */}
                    {existingImages.length + newImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                      >
                        <Plus className="h-8 w-8 mb-2" />
                        <span className="text-sm">Add Image</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                  />

                  <p className="text-sm text-muted-foreground mt-2">
                    Upload up to 4 high-quality images of your product. First image will be used as the main display
                    image.
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Update Product"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}

