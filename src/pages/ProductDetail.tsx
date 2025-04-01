
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "@/data/products";
import { Product } from "@/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        navigate("/shop");
      }
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <p>Loading product...</p>
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
