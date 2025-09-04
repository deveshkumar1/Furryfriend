"use client";

import LoginForm from './LoginForm';

export default function LoginModal({ open, onClose, title, onSuccess }: { 
  open: boolean; 
  onClose: () => void; 
  title?: string;
  onSuccess?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">{title || 'Sign In'}</h2>
        <LoginForm onSuccess={onSuccess || onClose} />
      </div>
    </div>
  );
}
