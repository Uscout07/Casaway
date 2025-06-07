// components/ConfirmDialog.tsx
import React from 'react';
import { Icon } from '@iconify/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <Icon 
            icon={type === 'danger' ? 'mdi:alert-circle' : 'mdi:help-circle'} 
            className={`w-6 h-6 mr-3 ${type === 'danger' ? 'text-red-500' : 'text-yellow-500'}`}
          />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-forest hover:bg-teal-700'
            }`}
          >
            {type === 'danger' ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;