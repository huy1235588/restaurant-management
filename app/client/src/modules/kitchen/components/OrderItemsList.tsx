import { OrderItem } from "../types/kitchen.types";

interface OrderItemsListProps {
  items: OrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.orderItemId}
          className="flex justify-between items-start p-2 bg-gray-50 dark:bg-gray-800 rounded"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {item.quantity}x
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {item.menuItem.itemName}
              </span>
            </div>
            {item.specialRequest && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 italic">
                Note: {item.specialRequest}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
