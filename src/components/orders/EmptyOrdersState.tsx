
import { ShoppingBag } from "lucide-react";

export const EmptyOrdersState = () => {
  return (
    <div className="bg-background rounded-lg border p-10 text-center">
      <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h2 className="text-xl font-medium mb-2">No orders yet</h2>
      <p className="text-muted-foreground mb-6">
        There are no orders in the system yet
      </p>
    </div>
  );
};
