export interface GroceryItem {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
  category: string;
  unit: string;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
}
