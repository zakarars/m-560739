
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
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

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
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    // Just set the pending status but don't save yet
    setPendingStatus(newStatus as OrderStatus);
  };

  const handleSaveStatus = async () => {
    if (!pendingStatus || pendingStatus === currentStatus) return;
    
    try {
      setIsUpdating(true);
      console.log(`Saving order status for order ${orderId}: ${pendingStatus}`);
      await onStatusChange(orderId, pendingStatus as OrderStatus);
      
      // Only update the current status after successful save
      setCurrentStatus(pendingStatus);
      setPendingStatus(null);
    } catch (error) {
      console.error("Error updating status:", error);
      // Reset pending status on error
      setPendingStatus(null);
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine which status to display in the select
  const displayStatus = pendingStatus || currentStatus;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={displayStatus}
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
      
      {pendingStatus && pendingStatus !== currentStatus && (
        <Button 
          size="sm" 
          onClick={handleSaveStatus} 
          disabled={isUpdating}
          className="ml-1"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      )}
    </div>
  );
};
