
import React from "react";
import { OrderStatusSelect } from "@/components/orders/OrderStatusSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Loader2 } from "lucide-react";
import { Order, OrderStatus } from "@/types/orders";

export interface AdminOrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({
  orders,
  onStatusChange,
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
              <TableCell>
                {new Date(order.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {order.shipping_address.fullName}
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <OrderStatusSelect
                  currentStatus={order.status}
                  onStatusChange={async (newStatus) => {
                    await onStatusChange(order.id, newStatus);
                  }}
                />
              </TableCell>
              <TableCell>
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/admin/orders/${order.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View order details</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
