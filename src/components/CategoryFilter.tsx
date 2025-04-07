
import React from 'react';
import { Button } from "@/components/ui/button";

export interface CategoryFilterProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  currentCategory, 
  onSelectCategory 
}) => {
  const categories = [
    { id: "all", name: "All Products" },
    { id: "kitchenware", name: "Kitchenware" },
    { id: "decor", name: "Home Decor" },
    { id: "bathroom", name: "Bathroom" },
    { id: "accessories", name: "Accessories" }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={currentCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.id)}
          className="capitalize"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
