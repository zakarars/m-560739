
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { getProductsByCategory } from "@/services/productService";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const { 
    data: products, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => getProductsByCategory(activeCategory),
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8 text-center md:text-left">
          Shop Our Handcrafted Collection
        </h1>
        
        <CategoryFilter 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">There was an error loading products.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {!products?.length && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No products found in this category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
