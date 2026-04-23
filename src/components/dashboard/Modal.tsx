import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
}

export default function Modal({ open, onClose, closeOnOutsideClick = true, children }: ModalProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-all ${
        open ? "visible bg-slate-950/70" : "invisible"
      }`}
      onClick={closeOnOutsideClick ? onClose : () => {}}
      role="presentation"
    >
      <div
        className={`relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_35px_120px_rgba(15,23,42,0.15)] transition-transform ${
          open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
