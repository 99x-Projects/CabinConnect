import type { ApiResponse, GroceryItem } from '../types/grocery';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function fetchGroceryCatalog(accessToken: string, category?: string): Promise<GroceryItem[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);

  const query = params.size > 0 ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/api/groceries${query}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch grocery catalog: ${response.status}`);
  }

  const json: ApiResponse<GroceryItem[]> = await response.json();
  return json.data;
}
