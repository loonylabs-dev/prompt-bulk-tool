'use client';

import { ReactNode } from 'react';

export interface DialogProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function Dialog({ show, onClose, title, children, actions, maxWidth = 'md' }: DialogProps) {
  if (!show) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg ${maxWidthClasses[maxWidth]} w-full p-6`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
        
        <div className="text-gray-600 mb-6">
          {children}
        </div>
        
        {actions && (
          <div className="flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Spezielle Dialog-Typen
export interface ConfirmDialogProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
  cancelText?: string;
}

export function ConfirmDialog({
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Bestätigen',
  confirmVariant = 'danger',
  cancelText = 'Abbrechen'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonClass = confirmVariant === 'danger' 
    ? 'btn btn-danger btn-md'
    : 'btn btn-primary btn-md';

  return (
    <Dialog
      show={show}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button
            onClick={handleConfirm}
            className={`flex-1 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-md"
          >
            {cancelText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}

export interface AlertDialogProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  buttonText?: string;
}

export function AlertDialog({
  show,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}: AlertDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'btn btn-success btn-md w-full';
      case 'error':
        return 'btn btn-danger btn-md w-full';
      default:
        return 'btn btn-primary btn-md w-full';
    }
  };

  return (
    <Dialog
      show={show}
      onClose={onClose}
      title={`${getIcon()} ${title}`}
      actions={
        <button
          onClick={onClose}
          className={getButtonClass()}
        >
          {buttonText}
        </button>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}