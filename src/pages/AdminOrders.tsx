
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

      if (fetchError) throw fetchError;

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

  // Setup a real-time subscription to listen for order updates
  useEffect(() => {
    if (!user || !isAdmin) return;
    
    console.log("Setting up real-time subscription for admin...");
    
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
          console.log("Admin real-time update received:", payload);
          
          // Update the local state when an order is updated
          setOrders(currentOrders => {
            const updatedOrder = fromDbOrder(payload.new);
            const updatedOrders = currentOrders.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            );
            
            console.log("Updated orders state:", updatedOrders);
            return updatedOrders;
          });
          
          // Show a toast notification when an order is updated
          toast.info(`Order #${payload.new.id.substring(0, 8)} updated to ${payload.new.status}`);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
      
    return () => {
      console.log("Cleaning up real-time subscription...");
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  // Completely rebuilt status update function
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> => {
    try {
      // Set updating state to show loading UI
      setUpdating(orderId);
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      // Step 1: Verify the order exists before attempting to update
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id, status")
        .eq("id", orderId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking order existence:", checkError);
        toast.error(`Error verifying order: ${checkError.message}`);
        return;
      }
      
      if (!existingOrder) {
        console.error("Order not found:", orderId);
        toast.error("Cannot update: Order not found in database");
        return;
      }
      
      console.log("Found order to update:", existingOrder);
      
      // Step 2: Perform the update operation
      const { data, error: updateError } = await supabase
        .from("orders")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", orderId)
        .select();
      
      if (updateError) {
        console.error("Database error updating order status:", updateError);
        toast.error(`Update failed: ${updateError.message}`);
        return;
      }
      
      if (!data || data.length === 0) {
        console.error("No records were updated for ID:", orderId);
        toast.error("Update failed: No records affected");
        return;
      }
      
      console.log("Update successful, response:", data);
      
      // Local state update is handled by the realtime subscription,
      // but we'll update it here too for immediate feedback
      const updatedOrder = fromDbOrder(data[0]);
      setOrders(currentOrders =>
        currentOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      );
      
      toast.success(`Order #${orderId.substring(0, 8)} updated to ${newStatus}`);
    } catch (error: any) {
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
