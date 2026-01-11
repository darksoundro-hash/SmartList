
export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  bought: boolean;
  aisle?: string;
  imageUrl?: string;
}

export interface GroceryList {
  id: string;
  name: string;
  store: string;
  createdAt: string;
  shoppingDate?: string;
  maxBudget?: number;
  items: GroceryItem[];
  progress: number;
  estimatedTotal: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  store: string;
  itemCount: number;
  totalValue: number;
  isFavorite?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  isPremium: boolean;
}
