
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
  const [updating, setUpdating] = useState<string | null>(null);

  // Check if user is an admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  useEffect(() => {
    // Log auth details for debugging
    console.log("Auth state:", {
      userPresent: !!user,
      userEmail: user?.email,
      isAdmin,
      userId: user?.id
    });
  }, [user, isAdmin]);

  // Fetch all orders
  const fetchAllOrders = async () => {
    if (!user || !isAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching all orders for admin...");
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error details:", fetchError);
        throw fetchError;
      }

      console.log("Fetched orders data:", data);
      const typedOrders = data ? data.map((order) => fromDbOrder(order)) : [];
      console.log("Processed orders:", typedOrders);

      setOrders(typedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllOrders();
  }, [user, isAdmin]);

  // Setup a real-time subscription for order updates
  useEffect(() => {
    if (!user || !isAdmin) return;
    
    console.log("Setting up real-time subscription for admin...");
    
    const channel = supabase
      .channel('admin-orders-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders'
        }, 
        (payload) => {
          console.log("Admin real-time update received:", payload);
          
          // Update the local state when an order is updated
          setOrders(currentOrders => {
            const updatedOrder = fromDbOrder(payload.new);
            return currentOrders.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            );
          });
          
          // Only show a toast if this wasn't triggered by our own update
          if (updating !== payload.new.id) {
            toast.info(`Order #${payload.new.id.substring(0, 8)} was updated to ${payload.new.status}`);
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
      
    return () => {
      console.log("Cleaning up real-time subscription...");
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, updating]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus): Promise<void> => {
    if (!user || !isAdmin) {
      toast.error("You don't have permission to update orders");
      return;
    }

    try {
      // Set updating state to show loading UI
      setUpdating(orderId);
      console.log(`Attempting to update order ${orderId} to status: ${newStatus}`);
      console.log("User details for update:", { 
        email: user.email, 
        id: user.id, 
        isAdmin 
      });
      
      // Optimistically update the UI immediately for better UX
      setOrders(currentOrders => 
        currentOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() } 
            : order
        )
      );
      
      // Perform the update with direct SQL (bypassing RLS for testing purposes)
      console.log("Executing database update...");
      const { data, error, count } = await supabase
        .from("orders")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", orderId)
        .select();
      
      console.log("Update response:", { data, error, count });
      
      if (error) {
        // Revert the optimistic update on error
        setOrders(currentOrders => 
          currentOrders.map(order => {
            // Find the original order to revert to
            const originalOrder = orders.find(o => o.id === orderId);
            return order.id === orderId && originalOrder 
              ? originalOrder 
              : order;
          })
        );
        
        console.error("Database error updating order status:", error);
        toast.error(`Update failed: ${error.message}`);
        return;
      }
      
      if (!data || data.length === 0) {
        // Revert the optimistic update if no records were affected
        setOrders(currentOrders => 
          currentOrders.map(order => {
            // Find the original order to revert to
            const originalOrder = orders.find(o => o.id === orderId);
            return order.id === orderId && originalOrder 
              ? originalOrder 
              : order;
          })
        );
        
        console.error("No records were updated for ID:", orderId);
        toast.error("Update failed: No records affected");
        return;
      }
      
      // Update succeeded - no need to update state again since we did it optimistically
      console.log("Successfully updated order:", data[0]);
      toast.success(`Order #${orderId.substring(0, 8)} updated to ${newStatus}`);
    } catch (error: any) {
      // Revert the optimistic update on exception
      setOrders(currentOrders => 
        currentOrders.map(order => {
          // Find the original order to revert to
          const originalOrder = orders.find(o => o.id === orderId);
          return order.id === orderId && originalOrder 
            ? originalOrder 
            : order;
        })
      );
      
      console.error("Unexpected error during update:", error);
      toast.error(`Update failed: ${error?.message || "Unknown error"}`);
    } finally {
      // Always clear the updating state
      setUpdating(null);
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

            <AdminOrdersTable 
              orders={orders} 
              onStatusChange={handleStatusChange} 
              updatingOrderId={updating}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
