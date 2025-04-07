
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiToInternalProduct } from "@/utils/productUtils";

const fetchProducts = async (category?: string) => {
  let query = supabase.from("products").select("*");
  
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data || [];
};

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
  });
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Error loading products
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </div>
      </Layout>
    );
  }
  
  // Convert API products to internal product format using our utility function
  const convertedProducts = products?.map(apiToInternalProduct) || [];
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shop Our Products</h1>
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {convertedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          
          {convertedProducts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
