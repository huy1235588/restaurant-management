import { UtensilsCrossed } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 dark:text-gray-400">
      <UtensilsCrossed className="h-16 w-16 mb-4 opacity-50" />
      <p className="text-xl font-semibold mb-2">No orders in queue</p>
      <p className="text-sm">Orders will appear here when they arrive</p>
    </div>
  );
}
