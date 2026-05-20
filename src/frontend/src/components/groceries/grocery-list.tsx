import { useEffect, useMemo, useState } from 'react';
import { fetchGroceryCatalog } from '../../api/groceries';
import { useSession } from '../../hooks/use-session';
import type { GroceryItem } from '../../types/grocery';
import { CategoryFilter } from './category-filter';

export function GroceryList() {
  const session = useSession();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort(),
    [items],
  );

  const displayedItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  useEffect(() => {
    if (!session?.access_token) return;

    setLoading(true);
    setError(null);

    fetchGroceryCatalog(session.access_token)
      .then(setItems)
      .catch(() => setError('Failed to load the grocery catalog. Please try again.'))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  if (loading) return <p>Loading catalog...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <section aria-label="Grocery catalog">
      <CategoryFilter categories={categories} selected={selectedCategory} onChange={setSelectedCategory} />
      <ul>
        {displayedItems.map((item) => (
          <li key={item.id}>
            <span>
              <strong>{item.name}</strong>
              {item.description && <span> — {item.description}</span>}
            </span>
            <span>
              {item.unitPrice.toFixed(2)} / {item.unit}
            </span>
            <span>{item.category}</span>
          </li>
        ))}
      </ul>
      {displayedItems.length === 0 && <p>No items available in this category.</p>}
    </section>
  );
}
