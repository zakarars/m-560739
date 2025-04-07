
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import Index from "@/pages/Index";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Orders from "@/pages/Orders";
import Admin from "@/pages/Admin";
import AdminOrders from "@/pages/AdminOrders";
import AdminProducts from "@/pages/AdminProducts";
import AdminUsers from "@/pages/AdminUsers";
import AdminUserDetail from "@/pages/AdminUserDetail";
import AdminUserEdit from "@/pages/AdminUserEdit";
import AdminOrderDetail from "@/pages/AdminOrderDetail";
import AdminAnalytics from "@/pages/AdminAnalytics";
import OurStory from "@/pages/OurStory";
import Auth from "@/pages/Auth";
import AuthError from "@/pages/AuthError";
import NotFound from "@/pages/NotFound";

// Stripe publishable key - this is safe to expose in the frontend code
const stripePromise = loadStripe("pk_test_REPLACE_WITH_YOUR_KEY");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <TooltipProvider>
              <Elements stripe={stripePromise}>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
                  <Route path="/admin/users/:userId/edit" element={<AdminUserEdit />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/our-story" element={<OurStory />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/error" element={<AuthError />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Elements>
            </TooltipProvider>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
