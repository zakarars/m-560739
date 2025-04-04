
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "./OrderStatusSelect";

interface AdminOrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const AdminOrdersTable = ({
  orders,
  onStatusChange,
}: AdminOrdersTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.id.substring(0, 8)}
              </TableCell>
              <TableCell>
                {format(new Date(order.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{order.shipping_address.fullName}</TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <OrderStatusSelect
                  status={order.status as OrderStatus}
                  onStatusChange={onStatusChange}
                  orderId={order.id}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  >
                    <a
                      href={`/order-confirmation/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
