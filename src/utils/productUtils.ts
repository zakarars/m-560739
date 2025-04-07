
import { Product as InternalProduct } from "@/types";
import { Product as ApiProduct } from "@/types/products";

// Convert API product to internal product format
export const apiToInternalProduct = (product: ApiProduct): InternalProduct => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageurl,
    category: product.category,
    featured: product.featured
  };
};

// Convert internal product to API format
export const internalToApiProduct = (product: InternalProduct): ApiProduct => {
  const { imageUrl, ...rest } = product;
  return {
    ...rest,
    imageurl: imageUrl,
    created_at: new Date().toISOString(), // Required field in ApiProduct, default to current timestamp
    updated_at: new Date().toISOString()
  };
};
