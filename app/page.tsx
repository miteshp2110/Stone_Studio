"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ShoppingBag, Shield, Award, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { formatCurrency, getImageUrl } from "@/lib/utils"

interface Product {
  id: number
  name: string
  description: string
  price: string
  image_urls: string
  category_id: number
}

export default function Home() {


  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {

    const uri = window.location.href
    const urlObject = new URL(uri);
    const jwt = urlObject.searchParams.get("jwt");
    
    if(jwt){
      // console.log(jwt)
      localStorage.setItem("token", jwt)
      window.location.href = `${process.env.NEXT_PUBLIC_CLIENT_URL}`
    }
    
    
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/products?limit=4`)
        if (response.ok) {
          const data = await response.json()
          setFeaturedProducts(data)
        }
      } catch (error) {
        console.error("Failed to fetch products", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/main.svg?height=1080&width=1920"
              alt="Luxury Digital Assets"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          </div>

          <div className="container mx-auto px-4 z-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover finely crafted stone art and premium-quality stones.
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-200">
              Whether you're looking for unique sculptures, decorative pieces, or natural stones for your projects, we bring you the finest selection with unmatched craftsmanship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent/90">
                  <Link href="/products">Explore Collection</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-black hover:bg-white/10">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Featured Products
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                Discover our most popular artworks, handpicked for exceptional quality and versatility.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {isLoading
                ? Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-200" />
                        <div className="p-4 space-y-3">
                          <div className="h-6 bg-gray-200 rounded w-3/4" />
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                          <div className="h-8 bg-gray-200 rounded w-1/3" />
                        </div>
                      </div>
                    ))
                : featuredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="product-card bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="relative h-48">
                          <Image
                            src={getImageUrl(product.image_urls) || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-lg mb-1 hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{__html:product.description}}
                        >
                          {/* {product.description.length > 60
                            ? product.description.substring(0, 60) + "..."
                            : product.description} */}
                            
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">{formatCurrency(Number.parseFloat(product.price))}</span>
                          <Button variant="outline" size="sm" className="text-xs">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/products" className="flex items-center gap-2">
                  View All Products <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Why Choose Us
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                We pride ourselves on delivering exceptional quality and service to our customers.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 rounded-lg text-center"
              >
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Quality</h3>
                <p className="text-muted-foreground">
                  All our stones are meticulously carved to meet the highest standards of quality and design.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card p-8 rounded-lg text-center"
              >
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Long Term Durable</h3>
                <p className="text-muted-foreground">
                  Your products are elegent with state-of-the-art and longetivity.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card p-8 rounded-lg text-center"
              >
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Customization</h3>
                <p className="text-muted-foreground">
                  Get your customized peice of art at your door steps.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonial Section
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Award className="h-12 w-12 mx-auto mb-6 text-accent" />
              <blockquote className="text-2xl md:text-3xl font-playfair italic mb-8">
                "The quality of digital assets from LuxeDigital has transformed our design workflow. Their attention to
                detail and premium quality is unmatched in the industry."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/placeholder.svg?height=48&width=48"
                    alt="Customer"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-gray-300">Creative Director, DesignCraft</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-accent/10 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Elevate Your Space?</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who have transformed their creative work with our premium stones.
              </p>
              <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent/90">
                <Link href="/products">Browse Our Collection</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

