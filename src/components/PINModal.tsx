import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Lock, Delete, Check, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PINModal: React.FC = () => {
  const { pinModalOpen, setPinModalOpen, verifyPin, executePendingAction, tripSettings } = useTrip();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!pinModalOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMsg('');
      if (nextPin.length === tripSettings.pinCode.length) {
        checkPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const checkPin = (pinToCheck: string) => {
    const success = verifyPin(pinToCheck);
    if (success) {
      setPinModalOpen(false);
      setPinInput('');
      executePendingAction();
    } else {
      setErrorMsg('PIN 碼錯誤，請重新輸入（預設為 007）');
      setTimeout(() => {
        setPinInput('');
      }, 600);
    }
  };

  const handleClose = () => {
    setPinModalOpen(false);
    setPinInput('');
    setErrorMsg('');
  };

  return (
    <AnimatePresence>
      <div 
        id="pin-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        onClick={handleClose}
      >
        <motion.div 
          id="pin-modal-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-xs bg-white rounded-3xl p-6 ac-shadow border-2 border-[#E2DEC9] relative text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button 
            id="close-pin-modal-btn"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F4F1EA] text-[#786C5E] hover:bg-[#EAE5D9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 mx-auto mb-3 bg-[#FAF7F0] border-2 border-[#5C8984] rounded-2xl flex items-center justify-center text-[#5C8984] ac-shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-[#4A4036] mb-1">隱私安全驗證</h3>
          <p className="text-xs text-[#8A7E72] mb-4">
            編輯或刪除預訂資料需輸入安全 PIN 碼<br/>
            <span className="text-[#5C8984] font-medium">(預設代碼：{tripSettings.pinCode})</span>
          </p>

          {/* PIN Dots */}
          <div className="flex justify-center items-center gap-3 mb-5">
            {Array.from({ length: Math.max(3, tripSettings.pinCode.length) }).map((_, idx) => (
              <div 
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  idx < pinInput.length 
                    ? 'bg-[#5C8984] border-[#5C8984] scale-110' 
                    : 'bg-[#F2EFE9] border-[#D5CFBF]'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1 text-xs text-[#E88873] font-bold mb-3"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                id={`pin-btn-${num}`}
                onClick={() => handleKeyPress(num)}
                className="h-12 bg-[#F9F7F1] hover:bg-[#F2EFE6] active:scale-95 text-[#4A4036] font-bold text-lg rounded-2xl border border-[#E0DACB] ac-shadow-sm flex items-center justify-center transition-all"
              >
                {num}
              </button>
            ))}
            <button
              id="pin-btn-clear"
              onClick={() => setPinInput('')}
              className="h-12 bg-[#F4F0E4] active:scale-95 text-xs font-bold text-[#8A7E72] rounded-2xl border border-[#E0DACB] flex items-center justify-center"
            >
              重填
            </button>
            <button
              id="pin-btn-0"
              onClick={() => handleKeyPress('0')}
              className="h-12 bg-[#F9F7F1] hover:bg-[#F2EFE6] active:scale-95 text-[#4A4036] font-bold text-lg rounded-2xl border border-[#E0DACB] ac-shadow-sm flex items-center justify-center transition-all"
            >
              0
            </button>
            <button
              id="pin-btn-delete"
              onClick={handleDelete}
              className="h-12 bg-[#F4F0E4] hover:bg-[#EAE4D4] active:scale-95 text-[#786C5E] rounded-2xl border border-[#E0DACB] flex items-center justify-center transition-all"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
