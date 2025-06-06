
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

// Helper function to check if user is admin
const checkIsAdmin = (user: any) => {
  if (!user) return false;
  
  // Check email list
  if (user.email && ADMIN_EMAILS.includes(user.email)) return true;
  
  // Check user metadata for role
  const userRole = user.user_metadata?.role;
  return userRole === 'admin';
};

// Order status components
const statusIcons = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  processing: <Check className="h-4 w-4 text-blue-500" />,
  shipped: <Truck className="h-4 w-4 text-purple-500" />,
  delivered: <PackageCheck className="h-4 w-4 text-green-500" />,
};

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  // Check if user is an admin
  const isAdmin = checkIsAdmin(user);
  
  // Debug logging
  console.log("Auth state:", { 
    user, 
    userEmail: user?.email, 
    userRole: user?.user_metadata?.role,
    isAdmin 
  });

  useEffect(() => {
    async function fetchAllOrders() {
      if (!user || !isAdmin) {
        console.log("User not authorized:", { user, isAdmin });
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching orders...");
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Supabase fetch error:", fetchError);
          throw fetchError;
        }

        console.log("Orders fetched:", data);
        const typedOrders = data ? data.map((order) => fromDbOrder(order)) : [];
        setOrders(typedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    }

  // Initial data fetch
  useEffect(() => {
    fetchAllOrders();
  }, [user, isAdmin]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      // First validate the status is a valid OrderStatus
      if (
        !["pending", "processing", "shipped", "delivered"].includes(newStatus)
      ) {
        throw new Error("Invalid status");
      }

      const { error, data } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No order found with this ID");
      }

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
