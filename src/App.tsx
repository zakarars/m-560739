
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import critical components directly
import Layout from "@/components/Layout";

// Lazily load page components to improve initial load time
const Index = lazy(() => import("@/pages/Index"));
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation"));
const Orders = lazy(() => import("@/pages/Orders"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminOrders = lazy(() => import("@/pages/AdminOrders"));
const AdminProducts = lazy(() => import("@/pages/AdminProducts"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminUserDetail = lazy(() => import("@/pages/AdminUserDetail"));
const AdminUserEdit = lazy(() => import("@/pages/AdminUserEdit"));
const AdminOrderDetail = lazy(() => import("@/pages/AdminOrderDetail"));
const AdminAnalytics = lazy(() => import("@/pages/AdminAnalytics"));
const OurStory = lazy(() => import("@/pages/OurStory"));
const Auth = lazy(() => import("@/pages/Auth"));
const AuthError = lazy(() => import("@/pages/AuthError"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Stripe publishable key - this is safe to expose in the frontend code
const stripePromise = loadStripe("pk_test_REPLACE_WITH_YOUR_KEY");

// Create a fallback component for when pages are loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Create a fallback for when components fail to load
const ErrorFallback = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="mb-6 text-muted-foreground">
        We encountered an error while loading this page. Please try refreshing the browser.
      </p>
      <button 
        className="px-4 py-2 bg-primary text-white rounded-md"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  </Layout>
);

// Create a query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
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
                <ErrorBoundary fallback={<ErrorFallback />}>
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
                </ErrorBoundary>
              </Elements>
            </TooltipProvider>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
