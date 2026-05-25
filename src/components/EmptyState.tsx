'use client';

export default function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="font-medium text-blue-900">{title}</p>
      <p className="text-sm text-blue-800">{description}</p>
    </div>
  );
}
