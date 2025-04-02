
import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  // Query to fetch order data
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!user || !orderId) return null;
      
      // First, fetch the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();
      
      if (orderError) throw orderError;
      
      // Then fetch the order items with product data
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*, products(*)")
        .eq("order_id", orderId);
      
      if (itemsError) throw itemsError;
      
      // Transform to match CartItem type structure
      const items = orderItems.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: item.products.price,
          imageUrl: item.products.imageurl,
          category: item.products.category,
          featured: item.products.featured
        }
      }));
      
      return {
        ...orderData,
        items
      };
    },
    enabled: !!user && !!orderId
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">The order you're looking for does not exist.</p>
          <Link to="/">
            <Button>
              Return to Homepage
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const shippingAddress = order.shipping_address;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-muted-foreground">
            Your order has been received and is being processed.
          </p>
        </div>
        
        <div className="border rounded-lg overflow-hidden mb-8">
          <div className="bg-muted/50 p-4 border-b">
            <h2 className="font-semibold">Order Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  ORDER INFORMATION
                </h3>
                <p className="mb-1"><strong>Order Number:</strong> {order.id.substring(0, 8)}</p>
                <p className="mb-1"><strong>Date:</strong> {formattedDate}</p>
                <p className="mb-1">
                  <strong>Status:</strong> 
                  <span className="inline-block ml-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </p>
                <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  SHIPPING INFORMATION
                </h3>
                <p className="mb-1">{shippingAddress.fullName}</p>
                <p className="mb-1">{shippingAddress.address}</p>
                <p className="mb-1">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
                <p>{shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden mb-8">
          <div className="bg-muted/50 p-4 border-b">
            <h2 className="font-semibold">Order Items</h2>
          </div>
          
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="py-3 px-4 text-left">Product</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.productId} className="border-b">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{item.product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-right">
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-center gap-4 mt-12">
          <Link to="/orders">
            <Button variant="outline">
              View All Orders
            </Button>
          </Link>
          <Link to="/">
            <Button>
              Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
