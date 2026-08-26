import React from 'react';
import { useTrip } from '../context/TripContext';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ConfirmModal: React.FC = () => {
  const { confirmDialogState, closeConfirmDialog } = useTrip();
  const { isOpen, title, message, confirmText, cancelText, danger, onConfirm } = confirmDialogState;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="confirm-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        onClick={closeConfirmDialog}
      >
        <motion.div
          id="confirm-modal-card"
          initial={{ scale: 0.92, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-sm bg-white rounded-[32px] p-6 ac-shadow border-2 border-[#E2DEC9] relative space-y-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close corner button */}
          <button
            id="confirm-modal-close-btn"
            onClick={closeConfirmDialog}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FAF8F3] hover:bg-[#F0ECE1] text-[#786C5E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border-2 ${
            danger
              ? 'bg-[#FDF0ED] border-[#F7CEC5] text-[#E8A598]'
              : 'bg-[#FAF8F3] border-[#E8E5D8] text-[#5D574F]'
          }`}>
            {danger ? (
              <Trash2 className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-[#E67E22]" />
            )}
          </div>

          {/* Title & Message */}
          <div className="space-y-1.5 px-2">
            <h3 className="text-base font-black text-[#5D574F]">
              {title || '確定要刪除嗎？'}
            </h3>
            <p className="text-xs text-[#8E8A81] leading-relaxed">
              {message}
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              id="confirm-modal-cancel-btn"
              type="button"
              onClick={closeConfirmDialog}
              className="w-full py-2.5 rounded-2xl border-2 border-[#E8E5D8] bg-[#FAF8F3] hover:bg-[#F0EBE0] text-[#786C5E] text-xs font-bold transition-all active:scale-95"
            >
              {cancelText || '取消'}
            </button>

            <button
              id="confirm-modal-confirm-btn"
              type="button"
              onClick={onConfirm}
              className={`w-full py-2.5 rounded-2xl text-xs font-bold text-white shadow-[2px_2px_0px_rgba(0,0,0,0.15)] active:scale-95 transition-all ${
                danger
                  ? 'bg-[#E8A598] hover:bg-[#D98A7D] border-2 border-[#D98A7D]'
                  : 'bg-[#8BBF9F] hover:bg-[#7AA88C] border-2 border-[#7AA88C]'
              }`}
            >
              {confirmText || '確定刪除'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
