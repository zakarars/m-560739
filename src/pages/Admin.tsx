
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Admin = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Get order count and total revenue
        const { count: orderCount, data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("total", { count: "exact" });
        
        if (orderError) throw orderError;
        
        const totalRevenue = orderData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
        
        // Get product count
        const { count: productCount, error: productError } = await supabase
          .from("products")
          .select("*", { count: "exact" });
        
        if (productError) throw productError;
        
        // Get user count
        const { count: userCount, error: userError } = await supabase
          .from("profiles")
          .select("*", { count: "exact" });
        
        if (userError) throw userError;
        
        setStats({
          totalOrders: orderCount || 0,
          totalProducts: productCount || 0,
          totalUsers: userCount || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your e-commerce store and monitor your business performance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/orders">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : stats.totalOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  View all orders
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/products">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : stats.totalProducts}
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage your inventory
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/users">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : stats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage your customers
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/analytics">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : `$${stats.totalRevenue.toFixed(2)}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  View sales analytics
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                View and manage your most recent orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Go to Orders Dashboard for full details</p>
                <Link to="/admin/orders" className="inline-block mt-4">
                  <button className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground">
                    View All Orders
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage your product inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Go to Products Dashboard to manage your inventory</p>
                <Link to="/admin/products" className="inline-block mt-4">
                  <button className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground">
                    View All Products
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
