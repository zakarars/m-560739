import { OrderStatus } from "@/types/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusIcons, statusLabels } from "./OrderStatusIcons";
import { useState } from "react";

interface OrderStatusSelectProps {
  status: OrderStatus;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  orderId: string;
}

export const OrderStatusSelect = ({
  status,
  onStatusChange,
  orderId,
}: OrderStatusSelectProps) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    try {
      setIsUpdating(true);
      await onStatusChange(orderId, newStatus as OrderStatus);
      setCurrentStatus(newStatus as OrderStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      // Keep the old status on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className={`w-[130px] ${isUpdating ? 'opacity-70' : ''}`}>
        <SelectValue placeholder="Status" />
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
  );
};
