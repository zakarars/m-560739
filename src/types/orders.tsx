
import { Clock, Package, Truck, CheckCircle } from "lucide-react";
import React from "react";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    imageurl: string;
    price: number;
    description?: string;
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  shipping_cost: number;
  shipping_address: ShippingAddress;
  created_at: string;
  payment_received: boolean;
  payment_intent_id?: string;
}

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered"
};

export const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  processing: <Package className="h-4 w-4 text-blue-500" />,
  shipped: <Truck className="h-4 w-4 text-purple-500" />,
  delivered: <CheckCircle className="h-4 w-4 text-green-500" />
};

export const calculateShippingCost = (address: ShippingAddress): number => {
  // Simple shipping cost calculation based on city
  if (address.city.toLowerCase() === 'yerevan') {
    return 5.00; // Special rate for Yerevan
  }
  
  // Free shipping for all other locations
  return 0;
};

// Helper function to convert a database order to our application Order type
export const fromDbOrder = (dbOrder: any): Order => {
  return {
    id: dbOrder.id,
    user_id: dbOrder.user_id,
    total: dbOrder.total,
    status: dbOrder.status as OrderStatus,
    shipping_cost: dbOrder.shipping_cost,
    shipping_address: dbOrder.shipping_address,
    created_at: dbOrder.created_at,
    payment_received: dbOrder.payment_received || false,
    payment_intent_id: dbOrder.payment_intent_id
  };
};
