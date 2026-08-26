import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { X, Save, RotateCcw, Shield, Coins, MapPin, Check, RefreshCw, Zap } from 'lucide-react';

interface TripSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_CURRENCIES = [
  { code: 'JPY', name: '日圓 ¥', defaultRate: 0.215 },
  { code: 'KRW', name: '韓元 ₩', defaultRate: 0.024 },
  { code: 'USD', name: '美元 $', defaultRate: 32.2 },
  { code: 'EUR', name: '歐元 €', defaultRate: 34.8 },
  { code: 'THB', name: '泰銖 ฿', defaultRate: 0.94 },
  { code: 'HKD', name: '港幣 HK$', defaultRate: 4.12 },
  { code: 'SGD', name: '星幣 S$', defaultRate: 24.5 },
  { code: 'GBP', name: '英鎊 £', defaultRate: 41.2 },
];

export const TripSettingsModal: React.FC<TripSettingsModalProps> = ({ isOpen, onClose }) => {
  const { tripSettings, updateTripSettings, resetToDefaultData, isUpdatingRate, refreshExchangeRate, showConfirmDialog } = useTrip();

  const [formData, setFormData] = useState({ ...tripSettings });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [localRateStatus, setLocalRateStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchRateNow = async () => {
    setLocalRateStatus('正在連線更新匯率...');
    const ok = await refreshExchangeRate(formData.foreignCurrency, formData.baseCurrency);
    if (ok) {
      setLocalRateStatus('✅ 匯率已成功更新為最新！');
      setFormData(prev => ({
        ...prev,
        exchangeRate: tripSettings.exchangeRate
      }));
    } else {
      setLocalRateStatus('⚠️ 取得失敗，請手動確認匯率');
    }
    setTimeout(() => setLocalRateStatus(null), 4000);
  };

  const handleSelectCurrency = (code: string, fallback: number) => {
    setFormData(prev => ({
      ...prev,
      foreignCurrency: code,
      exchangeRate: prev.foreignCurrency === code ? prev.exchangeRate : fallback
    }));
    // Trigger auto refresh for this currency
    refreshExchangeRate(code, formData.baseCurrency);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTripSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    showConfirmDialog({
      title: '重設所有手帳資料',
      message: '確定要將所有行程、記帳、住宿與清單重設為預設範例資料嗎？此動作將清除自訂項目。',
      confirmText: '確定重設',
      onConfirm: () => {
        resetToDefaultData();
        onClose();
      }
    });
  };

  return (
    <div 
      id="trip-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="trip-settings-modal-container"
        className="w-full max-w-md bg-white rounded-[28px] p-5 sm:p-6 shadow-[6px_6px_0px_#E0E5D5] border-2 border-[#E8E5D8] relative my-8 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0ECE1]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-base font-bold text-[#5D574F]">旅程手帳設定</h2>
          </div>
          <button 
            id="close-settings-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#FAF8F3] text-[#8E8A81] hover:bg-[#EFECE2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Trip Title */}
          <div>
            <label className="block font-bold text-[#5D574F] mb-1">手帳標題</label>
            <input
              type="text"
              id="settings-title-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FAF8F3] border-2 border-[#E8E5D8] focus:outline-none focus:border-[#8BBF9F] font-bold text-sm text-[#5D574F]"
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block font-bold text-[#5D574F] mb-1">目的地</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#8E8A81] absolute left-3.5 top-3" />
              <input
                type="text"
                id="settings-destination-input"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2 rounded-2xl bg-[#FAF8F3] border-2 border-[#E8E5D8] focus:outline-none focus:border-[#8BBF9F] font-bold text-[#5D574F]"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#5D574F] mb-1">出發日期</label>
              <input
                type="date"
                id="settings-start-date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl bg-[#FAF8F3] border-2 border-[#E8E5D8] focus:outline-none focus:border-[#8BBF9F] font-bold text-[#5D574F]"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#5D574F] mb-1">結束日期</label>
              <input
                type="date"
                id="settings-end-date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl bg-[#FAF8F3] border-2 border-[#E8E5D8] focus:outline-none focus:border-[#8BBF9F] font-bold text-[#5D574F]"
                required
              />
            </div>
          </div>

          {/* Currencies & Automatic Daily Exchange Rate Sync (Bento Section) */}
          <div className="p-3.5 sm:p-4 bg-[#FAF8F3] rounded-[24px] border-2 border-[#E8E5D8] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#8BBF9F]">
                <Coins className="w-4 h-4" />
                <span>即時匯率自動更新</span>
              </div>
              
              <button
                type="button"
                onClick={handleFetchRateNow}
                disabled={isUpdatingRate}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FAF8F3] text-[#5D574F] border border-[#E8E5D8] rounded-xl font-bold text-[10px] active:scale-95 transition-all"
              >
                <RefreshCw className={`w-3 h-3 text-[#8BBF9F] ${isUpdatingRate ? 'animate-spin' : ''}`} />
                <span>{isUpdatingRate ? '同步中...' : '立即同步'}</span>
              </button>
            </div>

            {/* Quick Currency Presets */}
            <div>
              <span className="text-[10px] font-bold text-[#8E8A81] block mb-1">常用旅遊幣別快捷選擇：</span>
              <div className="grid grid-cols-4 gap-1.5">
                {POPULAR_CURRENCIES.map(curr => {
                  const isSelected = formData.foreignCurrency === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleSelectCurrency(curr.code, curr.defaultRate)}
                      className={`px-2 py-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        isSelected
                          ? 'bg-[#8BBF9F] text-white border-[#7AA88C] shadow-xs'
                          : 'bg-white hover:bg-[#F2EFE6] text-[#5D574F] border-[#E8E5D8]'
                      }`}
                    >
                      {curr.name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-[#8E8A81] font-bold mb-0.5">本國貨幣</label>
                <input
                  type="text"
                  value={formData.baseCurrency}
                  onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value.toUpperCase() })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#E8E5D8] font-black text-center text-[#5D574F]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#8E8A81] font-bold mb-0.5">外幣代碼</label>
                <input
                  type="text"
                  value={formData.foreignCurrency}
                  onChange={(e) => setFormData({ ...formData, foreignCurrency: e.target.value.toUpperCase() })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#E8E5D8] font-black text-center text-[#5D574F]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#8E8A81] font-bold mb-0.5">換算匯率</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0.215 })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#E8E5D8] font-black text-center text-[#8BBF9F]"
                />
              </div>
            </div>

            {/* Auto update toggle checkbox */}
            <div className="flex items-center justify-between pt-1 border-t border-[#E8E5D8]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.autoUpdateRate !== false}
                  onChange={(e) => setFormData({ ...formData, autoUpdateRate: e.target.checked })}
                  className="w-4 h-4 rounded text-[#8BBF9F] focus:ring-[#8BBF9F] accent-[#8BBF9F]"
                />
                <span className="text-[11px] font-bold text-[#5D574F]">每日開啟 App 自動更新匯率</span>
              </label>

              <span className="text-[10px] text-[#8E8A81]">
                {tripSettings.lastRateUpdate ? `🕒 ${tripSettings.lastRateUpdate}` : '自動聯網同步'}
              </span>
            </div>

            {localRateStatus && (
              <p className="text-[11px] font-bold text-[#447A5C] bg-[#E5F2D5] p-2 rounded-xl text-center animate-in fade-in">
                {localRateStatus}
              </p>
            )}
          </div>

          {/* PIN Code Setting */}
          <div className="p-3.5 bg-[#FAF8F3] rounded-[24px] border-2 border-[#E8E5D8] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-[#5D574F]">
                <Shield className="w-4 h-4 text-[#8BBF9F]" />
                <span>預訂安全 PIN 碼</span>
              </div>
              <p className="text-[10px] text-[#8E8A81]">用於保護重要機票與飯店憑證修改 (預設 007)</p>
            </div>
            <input
              type="text"
              maxLength={4}
              value={formData.pinCode}
              onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
              className="w-16 px-2 py-1.5 bg-white border-2 border-[#E8E5D8] rounded-xl font-black text-center text-sm tracking-widest text-[#8BBF9F]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              id="reset-demo-data-btn"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 text-[#E8A598] hover:bg-[#FDF0ED] rounded-xl font-bold active:scale-95 transition-all text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重設範例資料</span>
            </button>

            <button
              type="submit"
              id="save-trip-settings-btn"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white rounded-2xl font-bold shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>已儲存！</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>儲存設定</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

