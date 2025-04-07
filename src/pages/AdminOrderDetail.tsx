
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusSelect } from "@/components/orders/OrderStatusSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Package, User } from "lucide-react";
import { OrderStatus, OrderItem, ShippingAddress, Order, fromDbOrder } from "@/types/orders";

const AdminOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<{
    first_name: string;
    last_name: string;
    email: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        
        // Get order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();
        
        if (orderError) throw orderError;
        
        // Convert the DB order to our type
        const parsedOrder = fromDbOrder(orderData);
        setOrder(parsedOrder);
        
        // Get order items
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            product:product_id (*)
          `)
          .eq("order_id", orderId);
        
        if (itemsError) throw itemsError;
        
        setOrderItems(items);
        
        // Get customer info
        const { data: customer, error: customerError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", orderData.user_id)
          .single();
        
        if (customerError) throw customerError;
        
        // Get email from auth
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(orderData.user_id);
        
        if (authError) throw authError;
        
        setCustomerInfo({
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: authUser?.user?.email || "No email found"
        });
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    try {
      setIsUpdating(true);
      
      // Update the order status
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link to="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const shippingAddress = order.shipping_address as ShippingAddress;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order #{orderId?.substring(0, 8)}</h1>
            <p className="text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusSelect 
                currentStatus={order.status as OrderStatus} 
                onStatusChange={handleStatusChange}
                isDisabled={isUpdating}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {customerInfo ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {customerInfo.first_name} {customerInfo.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customerInfo.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link to={`/admin/users/${order.user_id}`}>
                        <User className="h-4 w-4 mr-2" />
                        View Customer
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No customer information available</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p>{shippingAddress.address}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
                <p>{shippingAddress.country}</p>
              </address>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {orderItems.length > 0 ? (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded overflow-hidden">
                        <img
                          src={item.product?.imageurl}
                          alt={item.product?.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No items found</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(order.total - order.shipping_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shipping_cost.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Payment Status</p>
                  <p className={`text-sm ${order.payment_received ? "text-green-600" : "text-amber-600"}`}>
                    {order.payment_received ? "Paid" : "Pending"}
                  </p>
                </div>
                
                {order.stripe_payment_intent_id && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="text-sm font-mono">{order.stripe_payment_intent_id}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
