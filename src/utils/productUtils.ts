
import { Product as InternalProduct } from "@/types";
import { Product as ApiProduct } from "@/types/products";

// Convert API product to internal product format
export const apiToInternalProduct = (product: ApiProduct): InternalProduct => {
  return {
    ...product,
    imageUrl: product.imageurl,
    created_at: product.created_at || new Date().toISOString()
  };
};

// Convert internal product to API format
export const internalToApiProduct = (product: InternalProduct): ApiProduct => {
  const { imageUrl, ...rest } = product;
  return {
    ...rest,
    imageurl: imageUrl,
  };
};
