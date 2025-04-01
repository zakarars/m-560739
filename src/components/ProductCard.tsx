
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border hover:shadow-md transition-shadow duration-300">
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
          <Button 
            className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            size="sm"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-medium line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">{product.description}</p>
          <p className="mt-2 font-semibold">${product.price.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
}
