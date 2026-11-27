'use client';

import { ReactNode, useEffect, useRef } from 'react';

/** Modal memakai elemen <dialog> bawaan browser: fokus terkunci, Esc menutup, aksesibel tanpa library. */
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal" onClose={onClose} aria-labelledby="modal-title">
      {open && (
        <div className="modal-body">
          <h2 id="modal-title">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
