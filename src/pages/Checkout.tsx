
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate order processing
    setTimeout(() => {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Create order object (would normally be sent to a backend)
      const order = {
        id: orderId,
        items: [...items],
        total,
        status: "processing" as const,
        createdAt: new Date().toISOString(),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        }
      };
      
      // Store order in localStorage (just for demo)
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));
      
      // Clear cart and redirect to confirmation
      clearCart();
      setIsSubmitting(false);
      navigate(`/order-confirmation/${orderId}`);
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          <p className="text-muted-foreground mb-8">Your cart is empty. Please add some products before checking out.</p>
          <Button onClick={() => navigate("/shop")}>
            Browse Products
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State / Province</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <p className="text-muted-foreground text-sm mb-3">
                  Payment integration will be added later. For now, orders are processed without payment.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded overflow-hidden">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="text-sm">
                        {item.quantity} × {item.product.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{total >= 100 ? "Free" : "$10.00"}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>${(total >= 100 ? total : total + 10).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
