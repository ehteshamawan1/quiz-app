import React from "react";
import "./Modal.css";

type ModalProps = {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="nq-modal__backdrop" role="dialog" aria-modal="true">
      <div className="nq-modal">
        <div className="nq-modal__header">
          {title && <h3 className="nq-modal__title">{title}</h3>}
          <button className="nq-modal__close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="nq-modal__body">{children}</div>
      </div>
    </div>
  );
}
