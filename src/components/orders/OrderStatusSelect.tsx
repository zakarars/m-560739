
import { OrderStatus } from "@/types/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusIcons, statusLabels } from "./OrderStatusIcons";
import { Loader2 } from "lucide-react";

interface OrderStatusSelectProps {
  status: OrderStatus;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  orderId: string;
  isUpdating: boolean;
}

export const OrderStatusSelect = ({
  status,
  onStatusChange,
  orderId,
  isUpdating,
}: OrderStatusSelectProps) => {
  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return;
    
    try {
      await onStatusChange(orderId, newStatus as OrderStatus);
    } catch (error) {
      console.error("Error in status change handler:", error);
      // Error is handled in the parent component
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      <Select
        value={status}
        onValueChange={handleChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status">
            <div className="flex items-center gap-2">
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                statusIcons[status]
              )}
              <span className={isUpdating ? "text-muted-foreground" : ""}>
                {statusLabels[status]}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <div className="flex items-center gap-2">
              {statusIcons.pending}
              {statusLabels.pending}
            </div>
          </SelectItem>
          <SelectItem value="processing">
            <div className="flex items-center gap-2">
              {statusIcons.processing}
              {statusLabels.processing}
            </div>
          </SelectItem>
          <SelectItem value="shipped">
            <div className="flex items-center gap-2">
              {statusIcons.shipped}
              {statusLabels.shipped}
            </div>
          </SelectItem>
          <SelectItem value="delivered">
            <div className="flex items-center gap-2">
              {statusIcons.delivered}
              {statusLabels.delivered}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
