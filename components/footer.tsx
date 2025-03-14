import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-playfair font-bold mb-4">
            {process.env.NEXT_PUBLIC_COMPANY_FIRST_NAME}<span className="text-accent">{process.env.NEXT_PUBLIC_COMPANY_SECOND_NAME}</span>
            </h3>
            <p className="text-sm text-gray-300 mb-4">
            Discover finely crafted stone art and premium-quality stones.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/products?category=1" className="hover:text-accent transition-colors">
                  Stones
                </Link>
              </li>
              <li>
                <Link href="/products?category=2" className="hover:text-accent transition-colors">
                  Sculptures
                </Link>
              </li>
              <li>
                <Link href="/products?category=3" className="hover:text-accent transition-colors">
                  Arts
                </Link>
              </li>
              <li>
                <Link href="/products?category=4" className="hover:text-accent transition-colors">
                  Planning
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Contact Us</h4>
            <address className="not-italic text-sm text-gray-300 space-y-2">
              {/* <p>1234 Some Street</p> */}
              <p>Udaipur, India</p>
              <p>Email: shashankpatidar08@gmail.com</p>
              <p>Phone: (+91) 7067209692</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-6 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_COMPANY_FIRST_NAME}{process.env.NEXT_PUBLIC_COMPANY_SECOND_NAME}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <Link href="/faq" className="hover:text-accent transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

