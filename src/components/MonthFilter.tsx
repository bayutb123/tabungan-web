'use client';

function monthValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

export default function MonthFilter({ value, onChange }: { value: Date; onChange: (value: Date) => void }) {
  return (
    <input
      className="input-base"
      type="month"
      value={monthValue(value)}
      onChange={(e) => {
        const [year, month] = e.target.value.split('-').map(Number);
        onChange(new Date(year, (month || 1) - 1, 1));
      }}
    />
  );
}
