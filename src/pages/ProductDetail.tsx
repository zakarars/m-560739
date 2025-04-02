
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/productService";
import { Product } from "@/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const { 
    data: product, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-6 text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/shop")}>
            Return to Shop
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
            
            <div className="border-t border-b py-4 my-4">
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-medium">Quantity:</label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
              </div>
              
              <Button onClick={handleAddToCart} size="lg" className="mt-2">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium mb-2">Product Details:</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}</li>
                <li>Free shipping on orders over $100</li>
                <li>30-day return policy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
