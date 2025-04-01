
import Layout from "@/components/Layout";
import FeaturedProducts from "@/components/FeaturedProducts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Curated Essentials for Mindful Living
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover a collection of thoughtfully designed products that combine beauty and functionality.
            </p>
            <Link to="/shop">
              <Button size="lg" className="font-medium">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* About Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold mb-4">Our Philosophy</h2>
              <p className="text-muted-foreground mb-4">
                At Minimalist, we believe in the power of intentional living. Our curated collection brings together beautiful, functional products that enhance your everyday rituals.
              </p>
              <p className="text-muted-foreground">
                Each item is selected for its quality, sustainability, and timeless design—helping you build a home that reflects your values.
              </p>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1517705008128-361805f42e86?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="A minimalist interior with natural light"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
