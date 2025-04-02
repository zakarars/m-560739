
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { Package, Loader2, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch orders from Supabase
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // For each order, fetch the order items and products
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("*, products(*)")
            .eq("order_id", order.id);
          
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
            ...order,
            items
          };
        })
      );
      
      return ordersWithItems;
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your orders
          </p>
          <Button onClick={() => navigate("/auth")}>
            Sign In / Create Account
          </Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-8">We couldn't load your orders at this time.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
          <p className="text-muted-foreground mb-8">You haven't placed any orders yet.</p>
          <Link to="/shop">
            <Button>
              Start Shopping
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        
        <div className="space-y-6">
          {orders.map((order) => {
            const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            
            return (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {orderDate}
                    </p>
                    <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    
                    <Link to={`/order-confirmation/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Order
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex flex-col gap-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.productId} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded overflow-hidden">
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        + {order.items.length - 2} more item(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
