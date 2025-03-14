"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ShoppingCart, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import Cart from "@/components/cart"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { cartItems } = useCart()
  const { user, isAdmin  } = useAuth()

  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith("/admin")

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Don't show the navbar on the admin login page
  if (pathname === "/admin/login") return null

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-playfair font-bold text-primary"
              >
                {process.env.NEXT_PUBLIC_COMPANY_FIRST_NAME}<span className="text-accent">{process.env.NEXT_PUBLIC_COMPANY_SECOND_NAME}</span>
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {!isAdminPage && (
                <>
                  <NavLink href="/" label="Home" active={pathname === "/"} />
                  <NavLink href="/products" label="Products" active={pathname === "/products"} />
                  <NavLink href="/about" label="About" active={pathname === "/about"} />
                </>
              )}

              {isAdmin && <NavLink href="/admin" label="Admin Dashboard" active={pathname?.startsWith("/admin")} />}
              
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {!isAdminPage && (
                <>
                  {user ? (
                    <Link href="/profile">
                      <Button variant="ghost" size="icon" className="relative">
                        <User className="h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    // <Link href="/login">
                    //   <Button variant="ghost" size="sm">
                    //   <User className="h-5 w-5" />
                    //   </Button>
                    // </Link>
                    <></>
                  )}

                  {/* <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart className="h-5 w-5" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-xs text-primary w-5 h-5 rounded-full flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </Button> */}
                </>
              )}

              {/* Mobile menu button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {!isAdminPage && (
                <>
                  <MobileNavLink href="/" label="Home" onClick={() => setIsOpen(false)} />
                  <MobileNavLink href="/products" label="Products" onClick={() => setIsOpen(false)} />
                  <MobileNavLink href="/about" label="About" onClick={() => setIsOpen(false)} />
                </>
              )}

              {isAdmin && <MobileNavLink href="/admin" label="Admin Dashboard" onClick={() => setIsOpen(false)} />}
            </div>
          </motion.div>
        )}
      </header>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative font-medium text-sm transition-colors hover:text-accent ${
        active ? "text-accent" : "text-primary"
      }`}
    >
      {label}
      {active && (
        <motion.span layoutId="underline" className="absolute left-0 top-full block h-[2px] w-full bg-accent" />
      )}
    </Link>
  )
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} className="block py-2 text-base font-medium text-primary hover:text-accent" onClick={onClick}>
      {label}
    </Link>
  )
}

