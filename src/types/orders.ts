
import { Json } from '@/integrations/supabase/types';

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
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
  status: OrderStatus;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  items?: OrderItem[]; // Optional items if joined
}

// Helper function to convert from DB order to our order type
export function fromDbOrder(dbOrder: any): Order {
  // Ensure status is of type OrderStatus
  const status = dbOrder.status as OrderStatus;
  
  // Parse shipping_address from Json to ShippingAddress type
  const shipping_address = dbOrder.shipping_address as ShippingAddress;
  
  return {
    id: dbOrder.id,
    user_id: dbOrder.user_id,
    total: dbOrder.total,
    shipping_cost: dbOrder.shipping_cost || 0, // Default to 0 if not present
    status,
    shipping_address,
    created_at: dbOrder.created_at,
    updated_at: dbOrder.updated_at,
    items: dbOrder.items
  };
}

// New helper function to calculate shipping cost based on location
export function calculateShippingCost(address: ShippingAddress): number {
  // Check if the city is Yerevan (case insensitive)
  if (address.city.toLowerCase() === 'yerevan') {
    return 5.00; // $5 delivery fee for Yerevan
  }
  return 0; // Free shipping for other locations
}
