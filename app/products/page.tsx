"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { formatCurrency, getImageUrl } from "@/lib/utils"
import { set } from "date-fns"

import {getCartSet} from '../../lib/utils'


interface Product {
  id: number
  name: string
  description: string
  price: string
  image_urls: string
  category_id: number
  status: string
}

interface Category {
  id: number
  name: string
}

export default function ProductsPage() {
  const cartSet: Set<number> = getCartSet()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const searchParam = searchParams.get("search")

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParam || "")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    categoryParam ? [Number.parseInt(categoryParam)] : [],
  )
  const [showFilters, setShowFilters] = useState(false)
  

  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 10
  

  

  async function loadMore(){
    
    

    let url = `${process.env.NEXT_PUBLIC_SERVER_URL}/products?page=${pageNumber}&limit=${pageSize}`

    if (searchTerm || selectedCategories.length > 0) {
      url = `${process.env.NEXT_PUBLIC_SERVER_URL}/products/search`
      const params = new URLSearchParams()

      if (searchTerm) {
        params.append("name", searchTerm)
      }

      if (selectedCategories.length > 0) {
        params.append("category", selectedCategories.join(","))
      }
      params.append("page", pageNumber.toString())

      url += `?${params.toString()}`
    }
    try{
      
      const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()

          if(data.length === 0){
            alert("No more products to load")
          }
          else{
            if(searchTerm || selectedCategories.length > 0){
              


              if(pageNumber === 1){
                setProducts(data)
              }
              else{
              
                const newProducts = products.concat(data)
                
                setProducts(newProducts)
              }
              // setProducts(data)
            }else{
              if(pageNumber === 1){
                
                setProducts(data)
              }else{
                
              const newProducts = products.concat(data)
              
              setProducts(newProducts)
              }
            }

          }

          
        }    
    }
    catch(error){
      console.error("Failed to fetch products", error)
    }finally{
      // setIsLoading(false)
    }

    
  }


  useEffect(()=>{
    loadMore()
  },[pageNumber])

  

  const { addToCart } = useCart()

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
      }
    }

    fetchCategories()
  }, [])

 

  useEffect(() => {
  
    const fetchProducts = async () => {
      setIsLoading(true)
      

      try {
        let url = `${process.env.NEXT_PUBLIC_SERVER_URL}/products`

        // If we have search term or category filters, use search endpoint
        if (searchTerm || selectedCategories.length >= 0) {
          
          setPageNumber(1)
          url = `${process.env.NEXT_PUBLIC_SERVER_URL}/products/search`
          const params = new URLSearchParams()

          if (searchTerm) {
            params.append("name", searchTerm)
          }

          if (selectedCategories.length > 0) {
            params.append("category", selectedCategories.join(","))
          }
          params.append("page", pageNumber.toString())

          url += `?${params.toString()}`
        }

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()

          // Filter by price range
          
          
          
          setProducts(data)
        }
      } catch (error) {
        console.error("Failed to fetch products", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [searchTerm, selectedCategories])

  

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already triggered by the useEffect
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_urls: product.image_urls,
      quantity: 1,
    })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters - Mobile Toggle */}
            <div className="md:hidden mb-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {/* Filters Sidebar */}
            <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 lg:w-72`}>
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Search</h3>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                </div>

                {/* <div>
                  <h3 className="text-lg font-semibold mb-3">Price Range</h3>
                  <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex items-center justify-between">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div> */}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryChange(category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Digital Assets</h1>
                <p className="text-muted-foreground">
                  Browse our collection of premium digital assets for your creative projects.
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your search or filter criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategories([])
                      setPriceRange([0, 1000])
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) =>  (
                    
                    <motion.div
                    
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="product-card bg-white rounded-lg shadow-md overflow-hidden"
                      
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={getImageUrl(product.image_urls) || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-lg mb-1 hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2" dangerouslySetInnerHTML={{__html: product.description}}></p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">{formatCurrency(Number.parseFloat(product.price))}</span>
                          
                          <Button disabled={cartSet.has(product.id)} variant="outline" size="sm">
                            Enquire
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <Button className="mt-10" onClick={()=>{
                setPageNumber(pageNumber + 1)
                }}>Load More</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

