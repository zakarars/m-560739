
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { getProductsByCategory } from "@/data/products";
import { Product } from "@/types";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProductsByCategory(activeCategory));
  }, [activeCategory]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shop All Products</h1>
        
        <CategoryFilter 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
        
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
