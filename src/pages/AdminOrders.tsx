
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { AdminOrdersTable } from "@/components/orders/AdminOrdersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { OrderStatus, fromDbOrder, Order } from "@/types/orders";

// Helper function to get human-readable status name
const getStatusName = (status: OrderStatus) => {
  const statusNames: Record<OrderStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered"
  };
  return statusNames[status] || status;
};

const ORDERS_PER_PAGE = 10;

const AdminOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string>("");

  // Function to fetch orders with filtering
  const fetchOrders = async () => {
    try {
      console.log("Fetching orders with filters:", { statusFilter, searchQuery });
      
      let query = supabase
        .from("orders")
        .select(`
          *,
          user:profiles!orders_user_id_fkey (id, first_name, last_name),
          order_items (
            id,
            quantity,
            price,
            product:product_id (name, imageurl)
          )
        `)
        .order("created_at", { ascending: false });

      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply search query if present (searching by order ID or user first/last name)
      if (searchQuery) {
        query = query.or(`id.ilike.%${searchQuery}%,user.first_name.ilike.%${searchQuery}%,user.last_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        throw new Error(error.message);
      }

      console.log("Raw orders data:", data);
      
      // Convert the DB orders to our application Order type
      // Handle the case when data might be null or empty
      return (data || []).map(orderData => {
        try {
          return fromDbOrder(orderData);
        } catch (error) {
          console.error("Error converting order data:", error, orderData);
          return null;
        }
      }).filter(Boolean) as Order[];
    } catch (error) {
      console.error("Failed in fetchOrders:", error);
      throw error;
    }
  };

  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["adminOrders", statusFilter, searchQuery, currentPage],
    queryFn: fetchOrders
  });

  // Function to handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Function to update order status
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);

      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`Order status updated to ${getStatusName(newStatus)}`);
      refetch();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive mx-auto my-8 max-w-2xl">
          <h2 className="text-lg font-semibold">Error Loading Orders</h2>
          <p>{error instanceof Error ? error.message : "Unknown error occurred"}</p>
          <Button 
            variant="outline"
            className="mt-2"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const totalPages = Math.ceil((orders?.length || 0) / ORDERS_PER_PAGE);
  const paginatedOrders = orders?.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Orders</h1>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by order ID or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[240px]"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-0">
            {paginatedOrders && paginatedOrders.length > 0 ? (
              <AdminOrdersTable 
                orders={paginatedOrders} 
                onStatusChange={handleStatusChange}
                updatingOrderId={updatingOrderId}
              />
            ) : (
              <div className="text-center py-12 border rounded-md bg-background">
                <p className="text-muted-foreground">No orders found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
