
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const OurStory = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8 text-center">Our Story</h1>
        
        {/* Hero Image */}
        <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-12">
          <img 
            src="https://images.unsplash.com/photo-1604176424472-79e069c35964?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
            alt="Artisans working together" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-serif font-semibold mb-4">The Beginning</h2>
          <p className="text-muted-foreground mb-8">
            Artisan began with a simple idea: to celebrate traditional craftsmanship and create a marketplace for beautiful, functional, eco-friendly home goods. Our founder traveled through rural communities, meeting skilled artisans whose craft had been passed down through generations.
          </p>
          
          <h2 className="text-2xl font-serif font-semibold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            We're committed to preserving traditional craftsmanship by providing sustainable livelihoods for artisans. Every product in our collection is handmade using natural, sustainable materials and traditional techniques.
          </p>
          <p className="text-muted-foreground mb-8">
            By choosing our products, you're not just bringing a beautiful piece into your home – you're supporting an artisan community and helping preserve cultural heritage and sustainable practices.
          </p>
          
          <h2 className="text-2xl font-serif font-semibold mb-4">Our Artisans</h2>
          <p className="text-muted-foreground mb-8">
            We work directly with artisan cooperatives across different regions. Each community has its own unique techniques and traditions, resulting in distinctive designs and products. We ensure fair compensation and provide resources for our artisan partners to grow their skills and businesses.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1590422749897-47c47673ba0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Basket weaving" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className="font-medium font-serif text-lg">Basket Weaving</h3>
              <p className="text-sm text-muted-foreground">Traditional techniques using locally sourced natural fibers</p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1464454709131-ffd692591ee5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Textile weaving" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className="font-medium font-serif text-lg">Textile Crafts</h3>
              <p className="text-sm text-muted-foreground">Hand-loomed textiles using natural dyes and organic cotton</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/shop">
              <Button>
                Explore Our Collection <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OurStory;
