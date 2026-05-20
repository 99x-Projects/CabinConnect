interface CategoryFilterProps {
  categories: string[];
  selected: string | undefined;
  onChange: (category: string | undefined) => void;
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <nav aria-label="Filter by category">
      <button onClick={() => onChange(undefined)} aria-pressed={selected === undefined}>
        All
      </button>
      {categories.map((category) => (
        <button key={category} onClick={() => onChange(category)} aria-pressed={selected === category}>
          {category}
        </button>
      ))}
    </nav>
  );
}
