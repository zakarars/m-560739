
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageurl: string;
  category: string;
  featured?: boolean;
  created_at: string;
  updated_at?: string;
}
