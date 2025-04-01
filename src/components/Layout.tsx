
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Orders", path: "/orders" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold text-primary">Minimalist</Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px]">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-base font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-secondary py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Minimalist</h3>
              <p className="text-sm text-gray-600">
                Curated products for a simple, elegant lifestyle.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-600 hover:text-primary">Home</Link>
                </li>
                <li>
                  <Link to="/shop" className="text-sm text-gray-600 hover:text-primary">Shop</Link>
                </li>
                <li>
                  <Link to="/orders" className="text-sm text-gray-600 hover:text-primary">Orders</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <p className="text-sm text-gray-600">
                Email: hello@minimalist.com<br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-8 pt-4 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Minimalist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
