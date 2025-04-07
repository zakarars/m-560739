
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  BarChart,
  LogOut,
  Menu,
  X
} from "lucide-react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if the user is an admin (in a real app, you would check roles/permissions)
  const isAdmin = user && user.email === "arsen.zakaryan@gmail.com";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          You need to be logged in as an admin to access this page.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/admin",
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Orders",
      href: "/admin/orders",
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "Products",
      href: "/admin/products",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      label: "Analytics",
      href: "/admin/analytics",
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-64 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
