
import Layout from "@/components/Layout";
import FeaturedProducts from "@/components/FeaturedProducts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Recycle, Award, Heart } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary mb-4">
              <Leaf className="h-4 w-4 text-primary mr-1" strokeWidth={1.5} />
              <span className="text-xs font-medium">Handcrafted & Eco-Friendly</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
              Beautiful Handcrafted <br />Sustainable Living
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover our collection of artisan-made bags, baskets, underplates and carpets
              that celebrate traditional craftsmanship and respect for nature.
            </p>
            <Link to="/shop">
              <Button size="lg" className="font-medium">
                Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />
      
      {/* Values Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-semibold text-xl mb-2">Eco-Friendly</h3>
              <p className="text-muted-foreground">
                All our materials are sustainably sourced with respect for the environment.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-semibold text-xl mb-2">Artisan Crafted</h3>
              <p className="text-muted-foreground">
                Every piece is handmade by skilled artisans using traditional techniques.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-semibold text-xl mb-2">Community Support</h3>
              <p className="text-muted-foreground">
                We work directly with artisan communities to ensure fair wages and sustainable livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-serif font-semibold mb-4">Our Craft</h2>
              <p className="text-muted-foreground mb-4">
                At Artisan, we believe in the beauty of handmade goods. Our curated collection brings together beautiful, functional products that celebrate traditional craftsmanship.
              </p>
              <p className="text-muted-foreground mb-6">
                Each item is carefully made by skilled artisans using natural materials—creating unique, sustainable pieces that tell a story and connect you to age-old traditions.
              </p>
              <Link to="/our-story">
                <Button variant="outline">
                  Learn About Our Process <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="order-1 md:order-2 aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Artisan weaving a basket with natural fibers"
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
