
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderStatus, fromDbOrder } from "@/types/orders";
import { statusIcons, statusLabels } from "@/components/orders/OrderStatusIcons";
import { toast } from "sonner";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Debug logging
  console.log("Orders page - Auth state:", { user, userEmail: user?.email });

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        console.log("No user found, skipping fetch");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching orders for user:", user.id);
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (fetchError) {
          console.error("Supabase fetch error:", fetchError);
          throw fetchError;
        }

        console.log("Orders fetched:", data);
        const typedOrders = data ? data.map(order => fromDbOrder(order)) : [];
        console.log("Fetched orders:", typedOrders);
        
        setOrders(typedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  // Setup a real-time subscription to listen for order updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('orders-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log("User real-time update received:", payload);
          
          // Update the local state when an order is updated
          setOrders(currentOrders => 
            currentOrders.map(order => {
              if (order.id === payload.new.id) {
                const updatedOrder = fromDbOrder(payload.new);
                // Show a toast notification when status changes
                if (order.status !== updatedOrder.status) {
                  toast.info(`Order #${payload.new.id.substring(0, 8)} status changed to ${updatedOrder.status}`);
                }
                return updatedOrder;
              }
              return order;
            })
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Loading orders...</h1>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your orders
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold text-destructive mb-4">{error}</h1>
          <p className="text-muted-foreground mb-6">
            We encountered an error while loading your orders. Please try again later.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
        <p className="text-muted-foreground mb-8">
          Track and manage your orders
        </p>

        {orders.length === 0 ? (
          <div className="bg-background rounded-lg border p-10 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet
            </p>
            <Button asChild>
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-background rounded-lg border overflow-hidden">
            <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold">Order History</h2>
              <p className="text-sm text-muted-foreground">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </p>
            </div>
            
            <Separator />
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[order.status as OrderStatus]}
                          {statusLabels[order.status as OrderStatus]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="flex items-center"
                        >
                          <Link to={`/order-confirmation/${order.id}`}>
                            Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
