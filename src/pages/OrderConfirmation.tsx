import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Home, Package, ShoppingCart, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, fromDbOrder } from "@/types/orders";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrderDetails() {
      setIsLoading(true);
      try {
        // Get order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();
        
        if (orderError) throw orderError;

        // Convert from DB format to our app format
        const typedOrder = fromDbOrder(orderData);

        // Get order items and join with products
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            products:product_id (
              id, name, price, imageurl, description, category
            )
          `)
          .eq("order_id", orderId);
        
        if (itemsError) throw itemsError;

        // Transform product data to match our expected format
        const transformedItems = itemsData.map(item => ({
          ...item,
          product: {
            ...item.products,
            imageUrl: item.products.imageurl // Fix imageUrl field
          }
        }));

        setOrder(typedOrder);
        setItems(transformedItems);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Loading order details...</h1>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {error || "Order not found"}
          </h1>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 rounded-full p-3">
            <CheckCircle className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">Order Confirmed</h1>
        <p className="text-center text-muted-foreground mb-10">
          Thank you for your purchase! Your order has been received.
        </p>
        
        <div className="bg-background rounded-lg border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Order Details</h2>
            <p className="text-sm text-muted-foreground">
              Order #: {order.id.substring(0, 8)}
            </p>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded overflow-hidden">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${(order.total - (order.shipping_cost || 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {order.shipping_cost > 0 
                  ? `$${order.shipping_cost.toFixed(2)}` 
                  : 'Free'}
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-background rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          
          <div className="space-y-3">
            <p className="font-medium">{order.shipping_address.fullName}</p>
            <p>{order.shipping_address.address}</p>
            <p>
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
            </p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Button asChild variant="outline" size="lg" className="sm:w-auto">
            <Link to="/orders">
              <Package className="mr-2 h-4 w-4" />
              View All Orders
            </Link>
          </Button>
          
          <Button asChild size="lg" className="sm:w-auto">
            <Link to="/shop">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
