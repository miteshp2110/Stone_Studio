"use client"

import type React from "react"


import { useState, useRef, useEffect } from "react"
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
import RichTextEditor from "@/components/RichTextEditor"
import Navbar from "@/components/navbar"
import { useAuth } from "@/lib/auth-context"

export default function NewProductPage() {
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState("active")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { getToken } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/categories`)
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Failed to fetch categories", error)
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const files = e.target.files
    if (!files) {
      return
    }

    // Limit to 4 images total
    const remainingSlots = 4 - images.length
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: "You can only upload up to 4 images per product",
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

    setImages([...images, ...newFiles])
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls])

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
  
    const newImages = [...images]
    const newPreviewUrls = [...imagePreviewUrls]

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index])

    newImages.splice(index, 1)
    newPreviewUrls.splice(index, 1)

    setImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (images.length === 0) {
      alert("Select at least one image")
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

      // Append each image file
      
      images.forEach((image, index) => {
        formData.append(`images`, image)
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Product Added",
          description: "Your product has been added successfully",
        })
        router.push("/admin")
      } else {
        throw new Error("Failed to add product")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
              <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

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
                  {/* <Textarea
                    id="description"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  /> */}
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
                    {/* Image previews */}
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <Image
                    
                          src={url || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {/* Add image button */}
                    {images.length < 4 && (
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
                      "Add Product"
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

