
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OrderStatus, statusIcons, statusLabels } from "@/types/orders";

export interface OrderStatusSelectProps {
  currentStatus: OrderStatus;
  onStatusChange: (newStatus: OrderStatus) => Promise<void>;
  isDisabled?: boolean;
}

export function OrderStatusSelect({ 
  currentStatus, 
  onStatusChange, 
  isDisabled = false 
}: OrderStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: OrderStatus) => {
    if (status === currentStatus) {
      setOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusChange(status);
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={isDisabled || isUpdating}
        >
          <span className="flex items-center">
            <span className="mr-2">{statusIcons[currentStatus]}</span>
            {statusLabels[currentStatus]}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search status..." />
          <CommandEmpty>No status found.</CommandEmpty>
          <CommandGroup>
            {statuses.map((status) => (
              <CommandItem
                key={status}
                value={status}
                onSelect={() => handleStatusChange(status)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentStatus === status ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="mr-2">{statusIcons[status]}</span>
                {statusLabels[status]}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
