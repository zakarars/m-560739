
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, fromDbOrder } from "@/types/orders";
import { useStripe } from "@stripe/react-stripe-js";

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const stripe = useStripe();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | "pending">("pending");
  
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view your order");
      navigate("/auth");
      return;
    }
    
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
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
        
        // Check payment status from URL params (Stripe redirects with payment_intent and payment_intent_client_secret)
        if (window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const paymentIntentId = params.get("payment_intent");
          
          if (paymentIntentId && stripe) {
            const { paymentIntent } = await stripe.retrievePaymentIntent(
              params.get("payment_intent_client_secret") || ""
            );
            
            if (paymentIntent) {
              switch (paymentIntent.status) {
                case "succeeded":
                  setPaymentStatus("success");
                  break;
                case "processing":
                  setPaymentStatus("pending");
                  // Regularly check the order status
                  const interval = setInterval(async () => {
                    const { data } = await supabase
                      .from("orders")
                      .select("payment_received")
                      .eq("id", orderId)
                      .single();
                    
                    if (data?.payment_received) {
                      setPaymentStatus("success");
                      clearInterval(interval);
                    }
                  }, 5000);
                  return () => clearInterval(interval);
                default:
                  setPaymentStatus("failed");
                  break;
              }
            }
          }
        } else {
          // If no URL params, check the payment_received flag in the order
          setPaymentStatus(orderData.payment_received ? "success" : "pending");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, user, navigate, stripe]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <h1 className="text-3xl font-bold mb-2">Loading Order Details</h1>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </Layout>
    );
  }
  
  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link to="/orders">
            <Button>View Your Orders</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          {paymentStatus === "success" ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been received.
              </p>
            </>
          ) : paymentStatus === "failed" ? (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
              <p className="text-muted-foreground mb-4">
                Unfortunately, your payment could not be processed.
              </p>
              <Button onClick={() => navigate(`/checkout`)}>
                Try Again
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <h1 className="text-3xl font-bold mb-2">Processing Payment</h1>
              <p className="text-muted-foreground">
                We're processing your payment. This may take a moment.
              </p>
            </>
          )}
        </div>
        
        <div className="bg-background rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-medium">{order.id.substring(0, 8)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment</p>
              <p className="font-medium">
                {paymentStatus === "success" ? "Paid" : 
                  paymentStatus === "pending" ? "Processing" : "Failed"}
              </p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <h3 className="font-semibold mb-3">Shipping Address</h3>
          <address className="not-italic text-muted-foreground">
            {order.shipping_address.fullName}<br />
            {order.shipping_address.address}<br />
            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}<br />
            {order.shipping_address.country}
          </address>
        </div>
        
        <div className="bg-background rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {orderItems.length > 0 ? (
              orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded overflow-hidden">
                      <img 
                        src={item.product.imageurl} 
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p>No items found</p>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
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
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
