
import { Product } from "../types";

export const products: Product[] = [
  {
    id: "1",
    name: "Minimalist Desk Lamp",
    description: "A sleek, adjustable desk lamp with warm lighting perfect for late night work sessions.",
    price: 59.99,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "home",
    featured: true
  },
  {
    id: "2",
    name: "Ceramic Pour-Over Coffee Set",
    description: "Hand-crafted ceramic pour-over coffee maker with matching mug for the perfect morning brew.",
    price: 84.99,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "kitchen",
    featured: true
  },
  {
    id: "3",
    name: "Wool Throw Blanket",
    description: "Soft, warm wool blanket made from sustainable materials, perfect for cool evenings.",
    price: 129.99,
    imageUrl: "https://images.unsplash.com/photo-1600369671236-e74a2ed775a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "home",
    featured: true
  },
  {
    id: "4",
    name: "Leather Journal",
    description: "Handcrafted leather journal with recycled paper pages, perfect for notes and sketches.",
    price: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "accessories"
  },
  {
    id: "5",
    name: "Minimalist Watch",
    description: "Clean, simple timepiece with a leather band and Japanese movement.",
    price: 149.99,
    imageUrl: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "accessories",
    featured: true
  },
  {
    id: "6",
    name: "Natural Wood Serving Bowl",
    description: "Hand-carved serving bowl made from sustainable acacia wood.",
    price: 49.99,
    imageUrl: "https://images.unsplash.com/photo-1526434426615-1abe81efcb0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "kitchen"
  },
  {
    id: "7",
    name: "Cotton Throw Pillow Set",
    description: "Set of two 100% organic cotton throw pillows with removable covers.",
    price: 79.99,
    imageUrl: "https://images.unsplash.com/photo-1584145413785-10984d518e8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "home"
  },
  {
    id: "8",
    name: "Ceramic Plant Pot",
    description: "Modern ceramic pot for house plants with drainage system.",
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "home"
  },
  {
    id: "9",
    name: "French Press Coffee Maker",
    description: "Double-walled stainless steel French press that keeps coffee hot for hours.",
    price: 69.99,
    imageUrl: "https://images.unsplash.com/photo-1526280760714-f9e8b26f318f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "kitchen"
  },
  {
    id: "10",
    name: "Bamboo Bath Caddy",
    description: "Expandable bath tray made from sustainable bamboo with book and wine holder.",
    price: 45.99,
    imageUrl: "https://images.unsplash.com/photo-1583952335301-33e669e557f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "bathroom"
  }
];

export const categories = [
  { id: "all", name: "All Products" },
  { id: "home", name: "Home" },
  { id: "kitchen", name: "Kitchen" },
  { id: "accessories", name: "Accessories" },
  { id: "bathroom", name: "Bathroom" }
];

export const getProductById = (id: string) => {
  return products.find(product => product.id === id);
};

export const getFeaturedProducts = () => {
  return products.filter(product => product.featured);
};

export const getProductsByCategory = (category: string) => {
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};
