'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { dangerButton, secondaryButton } from './ui';

type ConfirmDeleteProps = {
  /** Server Action run when the user confirms (usually bound to the record id). */
  action: () => Promise<void>;
  title: string;
  description: string;
  /** Visible text of the trigger; omit for an icon-only button (then `label` is its accessible name). */
  triggerText?: string;
  label: string;
  triggerClassName: string;
};

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={dangerButton}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}

/** Delete button with a confirmation step (modal). */
export default function ConfirmDelete({ action, title, description, triggerText, label, triggerClassName }: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const trigger = triggerRef.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
        aria-label={triggerText ? undefined : label}
        title={triggerText ? undefined : label}
      >
        <Trash2 className="w-4 h-4" />
        {triggerText}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
          {/* Backdrop: click to cancel (keyboard users have Escape and the Cancel button) */}
          <div className="absolute inset-0 bg-black/40 animate-fade-in" aria-hidden="true" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white p-5 sm:p-6 shadow-xl animate-fade-in">
            <div className="flex gap-4">
              <span className="w-10 h-10 flex-shrink-0 rounded-full bg-red-50 text-red-600 inline-flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h2 id={titleId} className="text-base font-bold text-[#1a1a1a]">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-gray-600 break-words">{description}</p>
              </div>
            </div>
            <form action={action} className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" className={secondaryButton} onClick={() => setOpen(false)} autoFocus>
                Cancel
              </button>
              <ConfirmButton />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
