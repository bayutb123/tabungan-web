'use client';

import { TransactionCategory } from '@/types/saving';

export default function CategorySelect({
  value,
  categories,
  onChange,
}: {
  value: string | 'all';
  categories: TransactionCategory[];
  onChange: (value: string | 'all') => void;
}) {
  return (
    <select className="input-base" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="all">Semua Kategori</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
