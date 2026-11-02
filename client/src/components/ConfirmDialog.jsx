import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { Spinner } from './Feedback';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete this item?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
}) {
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (open) setWorking(false);
  }, [open]);

  const handleConfirm = async () => {
    setWorking(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // The parent surfaces a toast; keep the dialog open so the user can retry.
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={working ? () => {} : onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-outline" onClick={onClose} disabled={working}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={working}
            className="btn inline-flex bg-[#8c2f1b] text-cream hover:bg-[#742516]"
          >
            {working ? <Spinner size={16} /> : <Trash2 size={16} />}
            {working ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex gap-4 rounded-2xl border border-red-200 bg-red-50/60 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle size={18} />
        </span>
        <p className="text-sm leading-relaxed text-red-900/80">
          The item will be removed from the live site immediately. Any related comments are
          removed as well.
        </p>
      </div>
    </Modal>
  );
}
