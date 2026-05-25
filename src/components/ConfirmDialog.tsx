'use client';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Hapus',
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="panel w-full max-w-md p-5 shadow-xl">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Batal
          </button>
          <button type="button" onClick={onConfirm} className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-500">
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
