
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  shippingAddress: ShippingAddress;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
