
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, TrendingUp, ShoppingCart, Calendar, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  category: string;
  value: number;
  count: number;
}

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState("week");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Get date range based on timeframe
        const today = new Date();
        let startDate = new Date();
        
        if (timeframe === "week") {
          startDate.setDate(today.getDate() - 7);
        } else if (timeframe === "month") {
          startDate.setMonth(today.getMonth() - 1);
        } else if (timeframe === "year") {
          startDate.setFullYear(today.getFullYear() - 1);
        }
        
        // Format dates for Supabase query
        const startDateStr = startDate.toISOString();
        const endDateStr = today.toISOString();
        
        // Get orders for the date range
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .gte("created_at", startDateStr)
          .lte("created_at", endDateStr)
          .order("created_at", { ascending: true });
        
        if (ordersError) throw ordersError;
        
        // Get order items for category analysis
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            product:product_id (*)
          `)
          .in("order_id", orders.map(order => order.id) || []);
        
        if (itemsError) throw itemsError;
        
        // Process sales data by date
        const salesByDate = new Map<string, { revenue: number; orders: number }>();
        const categoryMap = new Map<string, { value: number; count: number }>();
        
        let totalSales = 0;
        
        orders.forEach(order => {
          const date = new Date(order.created_at).toLocaleDateString();
          const existingData = salesByDate.get(date) || { revenue: 0, orders: 0 };
          
          salesByDate.set(date, {
            revenue: existingData.revenue + order.total,
            orders: existingData.orders + 1,
          });
          
          totalSales += order.total;
        });
        
        // Process category data
        orderItems.forEach(item => {
          const category = item.product?.category || "Unknown";
          const existingData = categoryMap.get(category) || { value: 0, count: 0 };
          
          categoryMap.set(category, {
            value: existingData.value + (item.price * item.quantity),
            count: existingData.count + item.quantity,
          });
        });
        
        // Convert maps to arrays for charts
        const salesDataArray = Array.from(salesByDate).map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
        }));
        
        const categoryDataArray = Array.from(categoryMap).map(([category, data]) => ({
          category,
          value: data.value,
          count: data.count,
        }));
        
        // Get active user count
        const { count: userCount, error: userError } = await supabase
          .from("profiles")
          .select("*", { count: "exact" });
        
        if (userError) throw userError;
        
        // Set state with processed data
        setSalesData(salesDataArray);
        setCategoryData(categoryDataArray);
        setStats({
          totalSales: totalSales,
          totalOrders: orders.length,
          averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
          activeUsers: userCount || 0,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeframe]);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your store's performance and sales metrics
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : `$${stats.totalSales.toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeframe === "week" ? "Last 7 days" : timeframe === "month" ? "Last 30 days" : "Last year"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
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
                {timeframe === "week" ? "Last 7 days" : timeframe === "month" ? "Last 30 days" : "Last year"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : `$${stats.averageOrderValue.toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeframe === "week" ? "Last 7 days" : timeframe === "month" ? "Last 30 days" : "Last year"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : stats.activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Total registered users
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs 
          value={timeframe} 
          onValueChange={setTimeframe}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sales Overview</h2>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : salesData.length === 0 ? (
                <div className="flex items-center justify-center h-80">
                  <p className="text-muted-foreground">No sales data available</p>
                </div>
              ) : (
                <TabsContent value={timeframe} className="mt-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={salesData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue ($)" fill="#0088FE" />
                      <Bar dataKey="orders" name="Orders" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              )}
            </CardContent>
          </Card>
        </Tabs>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Distribution of sales across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-80">
                  <p className="text-muted-foreground">No category data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="category"
                      label={({category, percent}: any) => `${category}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`$${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Categories</CardTitle>
              <CardDescription>
                Categories with the highest quantities sold
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-80">
                  <p className="text-muted-foreground">No category data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categoryData.sort((a, b) => b.count - a.count)}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 80,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      name="Quantity Sold" 
                      fill="#00C49F" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
