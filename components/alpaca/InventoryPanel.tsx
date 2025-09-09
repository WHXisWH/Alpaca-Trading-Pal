import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useItems } from "@/hooks/useItems";
import { useAlpacaContract } from "@/hooks/useContract";

interface InventoryPanelProps {
  tokenId: string;
  currentEquipmentId: number;
}

const ITEM_NAMES: { [key: number]: string } = {
  1: "Crystal Ball",
  2: "Trading Terminal",
  101: "Knowledge Capsule",
};

export function InventoryPanel({ tokenId, currentEquipmentId }: InventoryPanelProps) {
  const { getUserBalances } = useItems();
  const { equipItem, unequipItem, isLoading } = useAlpacaContract();
  const [items, setItems] = useState<{ id: number; balance: number; name: string }[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const balances = await getUserBalances();
        const itemsWithNames = balances.map(({ id, balance }) => ({
          id,
          balance,
          name: ITEM_NAMES[id] || `Item ${id}`,
        }));
        setItems(itemsWithNames);
      } catch (error) {
        console.error("Failed to load items:", error);
        // Fallback to empty array
        setItems([]);
      }
    };

    loadItems();
  }, [getUserBalances]);

  const handleEquip = async (itemId: number) => {
    try {
      await equipItem(tokenId, itemId);
      console.log(`Successfully equipped item ${itemId} for Alpaca ${tokenId}`);
      // Optionally refresh the alpaca data or trigger a refetch
    } catch (error) {
      console.error("Failed to equip item:", error);
    }
  };

  const handleUnequip = async () => {
    try {
      await unequipItem(tokenId);
      console.log(`Successfully unequipped item for Alpaca ${tokenId}`);
      // Optionally refresh the alpaca data or trigger a refetch
    } catch (error) {
      console.error("Failed to unequip item:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory & Equipment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Currently Equipped</h4>
            <p className="text-sm text-gray-500">
              {currentEquipmentId !== 0 ? ITEM_NAMES[currentEquipmentId] : "None"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Your Items</h4>
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>{item.name} (x{item.balance})</span>
                  {item.id < 100 && item.balance > 0 && (
                    <button 
                      onClick={() => handleEquip(item.id)} 
                      disabled={currentEquipmentId === item.id || isLoading}
                      className="px-3 py-2 text-xs bg-amber-500 text-white rounded disabled:bg-gray-400 min-h-[32px] min-w-[48px] touch-manipulation"
                    >
                      {isLoading ? "..." : currentEquipmentId === item.id ? "Equipped" : "Equip"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
             {currentEquipmentId !== 0 && (
                <button 
                  onClick={handleUnequip} 
                  disabled={isLoading}
                  className="mt-4 w-full px-3 py-2 text-xs bg-red-500 text-white rounded disabled:bg-gray-400 min-h-[36px] touch-manipulation"
                >
                  {isLoading ? "..." : "Unequip Item"}
                </button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
