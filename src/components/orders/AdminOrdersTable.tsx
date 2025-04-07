
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatus, statusIcons, statusLabels } from "@/types/orders";
import { formatDistanceToNow } from "date-fns";
import { Eye } from "lucide-react";

interface AdminOrdersTableProps {
  orders: Order[];
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function AdminOrdersTable({
  orders,
  onStatusChange,
}: AdminOrdersTableProps) {
  const navigate = useNavigate();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!onStatusChange) return;
    
    setUpdatingOrderId(orderId);
    try {
      await onStatusChange(orderId, newStatus);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus => {
    const statusFlow: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return currentStatus;
    }
    
    return statusFlow[currentIndex + 1];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No orders found
              </TableCell>
            </TableRow>
          )}
          
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status as OrderStatus);
            const canProgress = nextStatus !== order.status;
            
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge variant={order.status === "delivered" ? "default" : "outline"}>
                    <span className="mr-1">
                      {statusIcons[order.status as OrderStatus]}
                    </span>
                    {statusLabels[order.status as OrderStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.shipping_address.fullName}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {onStatusChange && canProgress && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, nextStatus)}
                      disabled={updatingOrderId === order.id}
                    >
                      Mark as {statusLabels[nextStatus]}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
