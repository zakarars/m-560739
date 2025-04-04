
import { OrderStatus } from "@/types/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusIcons, statusLabels } from "./OrderStatusIcons";

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
  return (
    <Select
      defaultValue={status}
      onValueChange={(value) => onStatusChange(orderId, value as OrderStatus)}
    >
      <SelectTrigger className="w-[130px]">
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
