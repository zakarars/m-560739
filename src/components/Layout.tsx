
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Menu, Leaf } from "lucide-react";
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
    { name: "Our Story", path: "/our-story" },
    { name: "Orders", path: "/orders" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-secondary py-2">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-serif font-bold text-primary flex items-center">
              <Leaf className="h-6 w-6 mr-2" strokeWidth={1.5} />
              <span className="tracking-wide">Artisan</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className="text-sm font-medium hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] bg-background">
                <div className="flex flex-col gap-6 mt-8">
                  <Link to="/" className="flex items-center mb-6">
                    <Leaf className="h-5 w-5 mr-2 text-primary" strokeWidth={1.5} />
                    <span className="text-xl font-serif font-medium">Artisan</span>
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-base hover:text-primary transition-colors py-2 border-b border-border"
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

      <footer className="bg-secondary py-10 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif font-bold text-lg mb-4 flex items-center">
                <Leaf className="h-5 w-5 mr-2" strokeWidth={1.5} />
                Artisan
              </h3>
              <p className="text-sm text-muted-foreground">
                Handcrafted eco-friendly products made with love and respect for nature.
              </p>
            </div>
            
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shop</Link>
                </li>
                <li>
                  <Link to="/our-story" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Story</Link>
                </li>
                <li>
                  <Link to="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">Orders</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Contact</h3>
              <p className="text-sm text-muted-foreground">
                Email: hello@artisan.com<br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Artisan. All rights reserved. Handmade with care for the environment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
