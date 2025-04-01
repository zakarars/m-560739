
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { Package } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]") as Order[];
    setOrders(storedOrders);
  }, []);

  if (orders.length === 0) {
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
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
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
                    <p className="font-medium">Order #{order.id}</p>
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
