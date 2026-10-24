import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Transaction } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: Transaction | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
}) => {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Transaction"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-apple-sm bg-apple-red/10 border border-apple-red/20 text-apple-red">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            Are you sure you want to delete this record? This action cannot be undone.
          </div>
        </div>

        <div className="p-3 bg-apple-gray-50 dark:bg-apple-gray-850 rounded-apple-sm text-xs space-y-1">
          <div className="font-semibold text-apple-gray-900 dark:text-white">
            {transaction.description}
          </div>
          <div className="text-apple-gray-500">
            {transaction.category} • {formatINR(transaction.amount)} ({transaction.type})
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-apple-red hover:bg-red-600 text-white text-xs font-semibold rounded-apple-sm transition shadow-apple-pill"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </Modal>
  );
};
