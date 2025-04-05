
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderStatus, fromDbOrder } from "@/types/orders";
import { toast } from "sonner";
import { AdminOrdersTable } from "@/components/orders/AdminOrdersTable";
import { EmptyOrdersState } from "@/components/orders/EmptyOrdersState";
import { LoadingState, ErrorState, AccessDeniedState } from "@/components/orders/OrdersStateDisplay";

// Hardcoded list of admin emails for demo purposes
// In a real app, you would have a proper role-based system
const ADMIN_EMAILS = ["arsen.zakaryan@gmail.com"];

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if user is an admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  useEffect(() => {
    async function fetchAllOrders() {
      if (!user || !isAdmin) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        const typedOrders = data ? data.map((order) => fromDbOrder(order)) : [];

        setOrders(typedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllOrders();
  }, [user, isAdmin]);

  // Setup a real-time subscription to listen for order updates
  useEffect(() => {
    if (!user || !isAdmin) return;
    
    // Enable realtime updates for the orders table if admin
    const channel = supabase
      .channel('admin-orders-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders'
        }, 
        (payload) => {
          // Update the local state when an order is updated
          setOrders(currentOrders => 
            currentOrders.map(order => 
              order.id === payload.new.id 
                ? fromDbOrder(payload.new) 
                : order
            )
          );
          
          // Show a toast notification when an order is updated
          toast.info(`Order #${payload.new.id.substring(0, 8)} updated`);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", orderId);

      if (error) throw error;

      // Update the local state to reflect the change
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user || !isAdmin) {
    return <AccessDeniedState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin: Order Management</h1>
            <p className="text-muted-foreground">
              Manage and update customer orders
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Shop
          </Button>
        </div>

        {orders.length === 0 ? (
          <EmptyOrdersState />
        ) : (
          <div className="bg-background rounded-lg border overflow-hidden">
            <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold">All Orders</h2>
              <p className="text-sm text-muted-foreground">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </p>
            </div>

            <Separator />

            <AdminOrdersTable orders={orders} onStatusChange={handleStatusChange} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
