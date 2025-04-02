
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
  status: OrderStatus;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  items?: OrderItem[]; // Optional items if joined
}
