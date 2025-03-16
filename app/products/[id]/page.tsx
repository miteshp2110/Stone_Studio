"use client"
import "react-quill/dist/quill.snow.css";
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Heart, ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import { getCartSet } from "@/lib/utils";
interface Product {
  id: number
  name: string
  description: string
  price: string
  image_urls: string
  category_id: number
  status: string
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const cartSet: Set<number> = getCartSet()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be a specific endpoint like /products/:id
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/products/search?id=${params.id}`)
        if (response.ok) {
          const data = await response.json()
          console.log(data)
          // Find the product with the matching ID
          const foundProduct = Array.isArray(data)
            ? data.find((p: Product) => p.id === Number.parseInt(params.id))
            : data

          if (foundProduct) {
            setProduct(foundProduct)

            // Parse image URLs
            try {
              const imageUrls = foundProduct.image_urls
              setImages(Array.isArray(imageUrls) ? imageUrls : [])
            } catch (error) {
              console.error("Failed to parse image URLs", error)
              setImages([])
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch product", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_urls: product.image_urls,
        quantity: 1,
      })

      setIsAddedToCart(true)
      setTimeout(() => setIsAddedToCart(false), 2000)
    }
  }

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist)
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/2 mt-8"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
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
              <Link href="/products">Back to Products</Link>
            </Button>
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
              <Link href="/products">
                <ArrowLeft className="h-4 w-4" /> Back to Products
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative h-[400px] rounded-lg overflow-hidden border">
                <Image
                  src={images[selectedImage] || "/placeholder.svg?height=400&width=600"}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                        selectedImage === index ? "border-accent" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg?height=80&width=80"}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                {/* <p className="text-2xl font-semibold text-accent mb-4">
                  {formatCurrency(Number.parseFloat(product.price))}
                </p> */}

                <div className="prose max-w-none mb-8">
                <div
                    className="ql-editor"
                    style={{ padding: "10px", minHeight: "100px" }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                
                </div>
                
                
                 
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" className="flex-1 p-5" disabled={ cartSet.has(product.id) }>
                  Enquire
                  </Button>
                  {/* <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleWishlist}
                    className={isInWishlist ? "bg-accent/10 text-accent hover:bg-accent/20" : ""}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? "fill-accent" : ""}`} />
                    {isInWishlist ? "Added to Wishlist" : "Add to Wishlist"}
                  </Button> */}
                </div>

                {/* <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="license">License</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="p-4 border rounded-md mt-2">
                    <h3 className="font-semibold mb-2">Product Details</h3>
                    <p>
                      This premium digital asset is designed to elevate your creative projects with its exceptional
                      quality and attention to detail. Perfect for professional use in various applications.
                    </p>
                  </TabsContent>
                  <TabsContent value="specifications" className="p-4 border rounded-md mt-2">
                    <h3 className="font-semibold mb-2">Technical Specifications</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>High resolution (4K compatible)</li>
                      <li>Fully editable source files</li>
                      <li>Compatible with major software</li>
                      <li>Regular updates included</li>
                    </ul>
                  </TabsContent>
                  <TabsContent value="license" className="p-4 border rounded-md mt-2">
                    <h3 className="font-semibold mb-2">License Information</h3>
                    <p>
                      This product includes a standard license for personal and commercial use. Extended licenses are
                      available for larger projects or distribution.
                    </p>
                  </TabsContent>
                </Tabs> */}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

