
import { Clock, Check, Truck, PackageCheck } from "lucide-react";
import { OrderStatus } from "@/types/orders";

// Order status components
export const statusIcons = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  processing: <Check className="h-4 w-4 text-blue-500" />,
  shipped: <Truck className="h-4 w-4 text-purple-500" />,
  delivered: <PackageCheck className="h-4 w-4 text-green-500" />,
};

export const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export const OrderStatusIcon = ({ status }: { status: OrderStatus }) => {
  return (
    <div className="flex items-center gap-2">
      {statusIcons[status]}
      {statusLabels[status]}
    </div>
  );
};
