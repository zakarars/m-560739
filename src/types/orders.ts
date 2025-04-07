import { Json } from '@/integrations/supabase/types';

export interface ShippingAddress {
  fullName: string;
  address?: string;
  street?: string;
  city: string;
  state: string;
  zip?: string;
  zipCode?: string;
  country: string;
  email?: string;
  phone?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  product?: any; // Optional product details if joined
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  shipping_cost: number;
  tax: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  items?: OrderItem[]; // Optional items if joined
}

// Helper function to convert from DB order to our order type
export function fromDbOrder(dbOrder: any): Order {
  if (!dbOrder) {
    throw new Error("Invalid order data: Order is null or undefined");
  }

  if (!dbOrder.id || !dbOrder.user_id) {
    throw new Error("Invalid order data: Missing required fields (id or user_id)");
  }

  // Validate and ensure status is of type OrderStatus
  if (!dbOrder.status || !["pending", "processing", "shipped", "delivered"].includes(dbOrder.status)) {
    console.warn(`Invalid order status: ${dbOrder.status}, defaulting to 'pending'`);
    dbOrder.status = "pending";
  }
  const status = dbOrder.status as OrderStatus;
  
  // Validate and parse shipping_address
  if (!dbOrder.shipping_address) {
    console.warn("Order is missing shipping_address, creating a default one");
    dbOrder.shipping_address = {
      fullName: "Unknown",
      address: "Unknown",
      city: "Unknown",
      state: "Unknown",
      zipCode: "Unknown",
      country: "Unknown"
    };
  }

  try {
    // If shipping_address is a string, try to parse it
    let shipping_address = typeof dbOrder.shipping_address === 'string' 
      ? JSON.parse(dbOrder.shipping_address) 
      : dbOrder.shipping_address;
    
    // Make sure all required fields exist, even if they're empty
    shipping_address = {
      fullName: shipping_address.fullName || "Unknown",
      address: shipping_address.address || shipping_address.street || "Unknown",
      street: shipping_address.street || shipping_address.address || "Unknown",
      city: shipping_address.city || "Unknown",
      state: shipping_address.state || "Unknown",
      zip: shipping_address.zip || shipping_address.zipCode || "Unknown",
      zipCode: shipping_address.zipCode || shipping_address.zip || "Unknown",
      country: shipping_address.country || "Unknown",
      email: shipping_address.email || null,
      phone: shipping_address.phone || null,
    };
  
    return {
      id: dbOrder.id,
      user_id: dbOrder.user_id,
      total: Number(dbOrder.total) || 0,
      shipping_cost: Number(dbOrder.shipping_cost) || 0,
      tax: Number(dbOrder.tax) || 0,
      status,
      shipping_address,
      created_at: dbOrder.created_at || new Date().toISOString(),
      updated_at: dbOrder.updated_at || new Date().toISOString(),
      items: Array.isArray(dbOrder.items) ? dbOrder.items : undefined
    };
  } catch (error) {
    console.error("Error parsing order:", error);
    throw new Error(`Failed to parse order data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to calculate shipping cost based on location
export function calculateShippingCost(address: ShippingAddress): number {
  // Check if the city is Yerevan (case insensitive)
  if (address.city.toLowerCase() === 'yerevan') {
    return 5.00; // $5 delivery fee for Yerevan
  }
  return 0; // Free shipping for other locations
}
