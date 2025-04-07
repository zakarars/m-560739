import { PostgrestError } from "@supabase/supabase-js";

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  shipping_cost: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  payment_received: boolean;
  stripe_payment_intent_id?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: any;
}

export const fromDbOrder = (dbOrder: any): Order => {
  // Validate required fields
  if (!dbOrder) {
    throw new Error("Order data is null or undefined");
  }
  
  if (!dbOrder.id || !dbOrder.user_id || !dbOrder.total || !dbOrder.created_at) {
    console.error("Invalid order data:", dbOrder);
    throw new Error("Order data is missing required fields");
  }
  
  // Parse shipping address from JSON if needed
  let shippingAddress: ShippingAddress;
  
  if (typeof dbOrder.shipping_address === 'string') {
    try {
      shippingAddress = JSON.parse(dbOrder.shipping_address);
    } catch (e) {
      console.error("Error parsing shipping address:", e);
      throw new Error("Invalid shipping address format");
    }
  } else {
    shippingAddress = dbOrder.shipping_address as ShippingAddress;
  }
  
  // Return typed order object
  return {
    id: dbOrder.id,
    user_id: dbOrder.user_id,
    status: dbOrder.status || 'pending',
    total: dbOrder.total,
    shipping_cost: dbOrder.shipping_cost || 0,
    shipping_address: shippingAddress,
    created_at: dbOrder.created_at,
    updated_at: dbOrder.updated_at || dbOrder.created_at,
    payment_received: dbOrder.payment_received || false,
    stripe_payment_intent_id: dbOrder.stripe_payment_intent_id
  };
};

// Utility function to help filter/query orders
export const queryOrders = async (
  supabase: any,
  filters: {
    userId?: string;
    status?: OrderStatus;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }
) => {
  try {
    let query = supabase.from("orders").select("*");
    
    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    
    if (filters.fromDate) {
      query = query.gte("created_at", filters.fromDate.toISOString());
    }
    
    if (filters.toDate) {
      query = query.lte("created_at", filters.toDate.toISOString());
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    // Order by created_at (newest first)
    query = query.order("created_at", { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      orders: data ? data.map((order: any) => fromDbOrder(order)) : [],
      count,
      error: null,
    };
  } catch (error) {
    console.error("Error querying orders:", error);
    return {
      orders: [],
      count: 0,
      error: error as PostgrestError,
    };
  }
};

export const statusIcons = {
  pending: "⏳",
  processing: "⚙️",
  shipped: "🚚",
  delivered: "✅",
};

export const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};
