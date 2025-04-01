
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
          <p className="text-muted-foreground mb-8">Your cart is currently empty.</p>
          <Link to="/shop">
            <Button>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 text-left">Product</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.productId} className="border-t">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded overflow-hidden">
                            <img 
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              ${item.product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-3 w-6 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{total >= 100 ? "Free" : "$10.00"}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(total >= 100 ? total : total + 10).toFixed(2)}</span>
                </div>
              </div>
              
              <Link to="/checkout">
                <Button className="w-full">
                  Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <div className="mt-4 text-center">
                <Link to="/shop" className="text-sm text-primary hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
