import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { ExpenseItem } from '../../types';
import { 
  Wallet, 
  Plus, 
  Coins, 
  ArrowRightLeft, 
  Calculator, 
  Trash2, 
  Edit3, 
  Users, 
  Receipt, 
  Check, 
  ChevronDown,
  X,
  PieChart,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { PayerSelectGrid, SplitMembersSelectGrid, MemberAvatar } from '../MemberSelector';

const EXPENSE_CATEGORIES = [
  { id: 'food', label: '美食餐飲', emoji: '🍜', color: '#E67E22', bg: '#FDF2E9' },
  { id: 'transport', label: '交通乘車', emoji: '🚅', color: '#2980B9', bg: '#EBF5FB' },
  { id: 'spot', label: '景點門票', emoji: '⛩️', color: '#27AE60', bg: '#EAFAF1' },
  { id: 'shopping', label: '購物採買', emoji: '🛍️', color: '#8E44AD', bg: '#F4ECF7' },
  { id: 'lodging', label: '住宿房費', emoji: '🏨', color: '#D35400', bg: '#FBEEE6' },
  { id: 'other', label: '其他雜支', emoji: '✨', color: '#7F8C8D', bg: '#F2F4F4' }
] as const;

export const ExpenseTab: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    members,
    tripSettings,
    totalExpensesBase,
    totalExpensesForeign,
    isUpdatingRate,
    rateUpdateStatus,
    refreshExchangeRate,
    showConfirmDialog,
    setActiveTab
  } = useTrip();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [showSettlement, setShowSettlement] = useState<boolean>(false);
  const [showConverter, setShowConverter] = useState<boolean>(false);

  // Quick Currency Converter state
  const [convertAmount, setConvertAmount] = useState<number>(1000);
  const [convertDirection, setConvertDirection] = useState<'foreignToBase' | 'baseToForeign'>('foreignToBase');

  // Expense Form state
  const [formData, setFormData] = useState<{
    title: string;
    amount: string;
    currency: string;
    exchangeRate: number;
    category: 'food' | 'transport' | 'spot' | 'shopping' | 'lodging' | 'other';
    date: string;
    payerId: string;
    splitMemberIds: string[];
    receiptUrl: string;
    notes: string;
  }>({
    title: '',
    amount: '',
    currency: tripSettings.foreignCurrency,
    exchangeRate: tripSettings.exchangeRate,
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    payerId: members[0]?.id || 'm1',
    splitMemberIds: members.map(m => m.id),
    receiptUrl: '',
    notes: ''
  });

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      amount: '',
      currency: tripSettings.foreignCurrency,
      exchangeRate: tripSettings.exchangeRate,
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      payerId: members[0]?.id || 'm1',
      splitMemberIds: members.map(m => m.id),
      receiptUrl: '',
      notes: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (item: ExpenseItem) => {
    setEditingExpense(item);
    setFormData({
      title: item.title,
      amount: item.amount.toString(),
      currency: item.currency,
      exchangeRate: item.exchangeRate,
      category: item.category,
      date: item.date,
      payerId: item.payerId,
      splitMemberIds: item.splitMemberIds,
      receiptUrl: item.receiptUrl || '',
      notes: item.notes || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('請輸入有效金額');
      return;
    }

    if (formData.splitMemberIds.length === 0) {
      alert('請至少選擇一位分攤成員');
      return;
    }

    const payload = {
      title: formData.title,
      amount: parsedAmount,
      currency: formData.currency,
      exchangeRate: formData.exchangeRate,
      category: formData.category,
      date: formData.date,
      payerId: formData.payerId,
      splitMemberIds: formData.splitMemberIds,
      receiptUrl: formData.receiptUrl,
      notes: formData.notes
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }
    setModalOpen(false);
  };

  const toggleSplitMember = (memberId: string) => {
    setFormData(prev => {
      const exists = prev.splitMemberIds.includes(memberId);
      if (exists) {
        return { ...prev, splitMemberIds: prev.splitMemberIds.filter(id => id !== memberId) };
      } else {
        return { ...prev, splitMemberIds: [...prev.splitMemberIds, memberId] };
      }
    });
  };

  const selectAllMembers = () => {
    setFormData(prev => ({
      ...prev,
      splitMemberIds: members.map(m => m.id)
    }));
  };

  // Numpad key helper for modal
  const handleKeypadPress = (val: string) => {
    setFormData(prev => {
      if (val === 'DEL') {
        return { ...prev, amount: prev.amount.slice(0, -1) };
      }
      if (val === 'C') {
        return { ...prev, amount: '' };
      }
      if (val === '.' && prev.amount.includes('.')) {
        return prev;
      }
      return { ...prev, amount: prev.amount + val };
    });
  };

  // Smart Debt Settlement Calculation
  const calculateSettlements = () => {
    const balances: Record<string, number> = {};
    members.forEach(m => { balances[m.id] = 0; });

    expenses.forEach(item => {
      const costInBase = item.currency === tripSettings.baseCurrency 
        ? item.amount 
        : item.amount * item.exchangeRate;

      // Payer paid the total
      balances[item.payerId] = (balances[item.payerId] || 0) + costInBase;

      // Split members owe their share
      const splitCount = item.splitMemberIds.length || 1;
      const share = costInBase / splitCount;

      item.splitMemberIds.forEach(mId => {
        balances[mId] = (balances[mId] || 0) - share;
      });
    });

    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(balances).forEach(([id, balance]) => {
      if (balance < -1) {
        debtors.push({ id, amount: -balance });
      } else if (balance > 1) {
        creditors.push({ id, amount: balance });
      }
    });

    const transactions: { from: string; to: string; amount: number }[] = [];

    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      if (settlementAmount > 1) {
        transactions.push({
          from: debtor.id,
          to: creditor.id,
          amount: Math.round(settlementAmount)
        });
      }

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount < 1) dIdx++;
      if (creditor.amount < 1) cIdx++;
    }

    return { balances, transactions };
  };

  const { balances, transactions } = calculateSettlements();

  return (
    <div id="expense-tab-content" className="space-y-4 pb-12">
      {/* 1. Total Expense Dashboard & Stats (Bento Grid Header Card) */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FDF2E9] border border-[#FAD7A0] text-[#E67E22]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#8E8A81] uppercase font-bold tracking-wider">
                團體總支出儀表板
              </span>
              <h2 className="text-2xl font-black text-[#5D574F] tracking-tight">
                NT$ {Math.round(totalExpensesBase).toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="text-right bg-[#FAF8F3] px-3.5 py-2.5 rounded-2xl border border-[#E8E5D8]">
            <span className="text-[10px] text-[#8E8A81] block font-medium">換算當地貨幣</span>
            <span className="text-sm font-black text-[#8BBF9F]">
              ¥ {Math.round(totalExpensesForeign).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action buttons: Add Expense, Debt Balancer, Currency Calculator */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            id="add-expense-quick-btn"
            onClick={openAddModal}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white font-bold text-xs rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>記一筆</span>
          </button>

          <button
            id="open-settlement-btn"
            onClick={() => setShowSettlement(!showSettlement)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold border-2 transition-all active:scale-95 ${
              showSettlement
                ? 'bg-[#E8A598] text-white border-[#D68475] shadow-[2px_2px_0px_#D68475]'
                : 'bg-white hover:bg-[#FAF8F3] text-[#5D574F] border-[#E8E5D8] shadow-[2px_2px_0px_#E0E5D5]'
            }`}
          >
            <Users className={`w-4 h-4 ${showSettlement ? 'text-white' : 'text-[#E8A598]'}`} />
            <span>平攤結算</span>
          </button>

          <button
            id="open-currency-calc-btn"
            onClick={() => setShowConverter(!showConverter)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold border-2 transition-all active:scale-95 ${
              showConverter
                ? 'bg-[#E59866] text-white border-[#D48450] shadow-[2px_2px_0px_#D48450]'
                : 'bg-white hover:bg-[#FAF8F3] text-[#5D574F] border-[#E8E5D8] shadow-[2px_2px_0px_#E0E5D5]'
            }`}
          >
            <Coins className={`w-4 h-4 ${showConverter ? 'text-white' : 'text-[#E59866]'}`} />
            <span>匯率試算</span>
          </button>
        </div>

        {/* Currency converter expandable dropdown */}
        {showConverter && (
          <div className="bg-[#FAF8F3] p-3.5 sm:p-4 rounded-[24px] border-2 border-[#E8E5D8] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-[#8BBF9F]">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> 即時匯率快速換算
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => refreshExchangeRate()}
                  disabled={isUpdatingRate}
                  title="更新今日即時匯率"
                  className="text-[10px] text-[#5D574F] hover:text-[#8BBF9F] flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-[#E8E5D8] font-bold active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 text-[#8BBF9F] ${isUpdatingRate ? 'animate-spin' : ''}`} />
                  <span>{isUpdatingRate ? '同步中' : '更新匯率'}</span>
                </button>
                <button
                  onClick={() => setConvertDirection(prev => prev === 'foreignToBase' ? 'baseToForeign' : 'foreignToBase')}
                  className="text-[10px] text-[#5D574F] hover:text-[#8BBF9F] flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-[#E8E5D8] font-bold active:scale-95 transition-all"
                >
                  <ArrowRightLeft className="w-3 h-3" /> 切換方向
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-[#8E8A81] block font-medium mb-1">
                  {convertDirection === 'foreignToBase' ? `輸入 ${tripSettings.foreignCurrency}` : `輸入 ${tripSettings.baseCurrency}`}
                </label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border-2 border-[#E8E5D8] rounded-xl font-bold text-sm text-[#5D574F]"
                />
              </div>

              <span className="text-[#8E8A81] font-bold mt-4">≈</span>

              <div className="flex-1">
                <label className="text-[10px] text-[#8E8A81] block font-medium mb-1">
                  {convertDirection === 'foreignToBase' ? `換算 ${tripSettings.baseCurrency}` : `換算 ${tripSettings.foreignCurrency}`}
                </label>
                <div className="px-3 py-1.5 bg-white border-2 border-[#E8E5D8] rounded-xl font-black text-sm text-[#8BBF9F]">
                  {convertDirection === 'foreignToBase'
                    ? `NT$ ${Math.round(convertAmount * tripSettings.exchangeRate).toLocaleString()}`
                    : `¥ ${Math.round(convertAmount / tripSettings.exchangeRate).toLocaleString()}`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#8E8A81] pt-1 border-t border-[#E8E5D8]">
              <span>
                💡 1 {tripSettings.foreignCurrency} ≈ {tripSettings.exchangeRate} {tripSettings.baseCurrency}
              </span>
              <span>
                {tripSettings.lastRateUpdate ? `🕒 ${tripSettings.lastRateUpdate}` : '即時每日自動同步'}
              </span>
            </div>

            {rateUpdateStatus && (
              <div className="text-[11px] font-bold text-[#447A5C] bg-[#E5F2D5] p-2 rounded-xl text-center animate-in fade-in">
                {rateUpdateStatus}
              </div>
            )}
          </div>
        )}

        {/* Smart Settlement breakdown modal / section */}
        {showSettlement && (
          <div className="bg-[#FAF8F3] p-4 rounded-[22px] border-2 border-[#E8E5D8] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#5D574F] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#8BBF9F]" />
                <span>最佳化分帳結算 (結清每人代墊)</span>
              </h3>
              <span className="text-[10px] text-[#8E8A81] font-medium">自動消除循環債務</span>
            </div>

            {/* Individual Balances */}
            <div className="grid grid-cols-2 gap-2">
              {members.map(m => {
                const bal = balances[m.id] || 0;
                return (
                  <div key={m.id} className="p-2.5 bg-white rounded-2xl border border-[#E8E5D8] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate mr-1">
                      <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full border border-[#D5CFBF]" />
                      <span className="font-bold text-[#5D574F] truncate">{m.name.split(' ')[0]}</span>
                    </div>
                    <span className={`font-black text-xs ${bal >= 0 ? 'text-[#8BBF9F]' : 'text-[#E8A598]'}`}>
                      {bal >= 0 ? `+${Math.round(bal)}` : Math.round(bal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recommended transfers */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#8E8A81] block">💡 建議轉帳方案：</span>
              {transactions.length === 0 ? (
                <div className="p-2.5 bg-white rounded-2xl border border-[#E8E5D8] text-center text-xs text-[#8BBF9F] font-bold">
                  🎉 所有帳目已完全平攤結清！
                </div>
              ) : (
                transactions.map((t, idx) => {
                  const fromMember = members.find(m => m.id === t.from);
                  const toMember = members.find(m => m.id === t.to);

                  return (
                    <div key={idx} className="p-2.5 bg-white rounded-2xl border border-[#E8E5D8] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#5D574F]">
                        <span>{fromMember?.name.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8E8A81]" />
                        <span>{toMember?.name.split(' ')[0]}</span>
                      </div>
                      <span className="font-black text-sm text-[#E67E22]">
                        NT$ {t.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Expense List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#5D574F] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
            <span>🧾 每日支出明細</span>
            <span className="text-[10px] text-[#8E8A81] font-normal">({expenses.length} 筆)</span>
          </h3>
        </div>

        {expenses.length === 0 ? (
          <div className="bg-white rounded-[28px] p-8 border-2 border-dashed border-[#E8E5D8] text-center space-y-2">
            <p className="text-sm font-bold text-[#5D574F]">目前尚無記帳紀錄</p>
            <p className="text-xs text-[#8E8A81]">點擊上方「記一筆」快速記錄公費與平攤項目</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {expenses.map((item) => {
              const cat = EXPENSE_CATEGORIES.find(c => c.id === item.category) || EXPENSE_CATEGORIES[0];
              const payer = members.find(m => m.id === item.payerId);

              return (
                <div
                  key={item.id}
                  id={`expense-row-${item.id}`}
                  className="bg-white rounded-[24px] p-4 border-2 border-[#E8E5D8] shadow-[4px_4px_0px_#E0E5D5] hover:border-[#8BBF9F] transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-base shrink-0 border"
                        style={{ backgroundColor: cat.bg, borderColor: `${cat.color}40` }}
                      >
                        {cat.emoji}
                      </div>

                      <div className="truncate">
                        <h4 className="text-sm font-bold text-[#5D574F] truncate leading-tight">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8E8A81] mt-0.5">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span className="font-medium text-[#8BBF9F]">由 {payer?.name.split(' ')[0] || '成員'} 代付</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-[#5D574F] block">
                          {item.amount.toLocaleString()} {item.currency}
                        </span>
                        {item.currency !== tripSettings.baseCurrency && (
                          <span className="text-[10px] text-[#8E8A81] block font-medium">
                            ≈ NT$ {Math.round(item.amount * item.exchangeRate).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-[#8E8A81] hover:text-[#8BBF9F] rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-expense-${item.id}`}
                          onClick={() => {
                            showConfirmDialog({
                              title: '刪除支出記錄',
                              message: `確定要刪除「${item.title}」(${item.amount.toLocaleString()} ${item.currency}) 嗎？`,
                              onConfirm: () => deleteExpense(item.id)
                            });
                          }}
                          className="p-1.5 text-[#8E8A81] hover:text-[#E8A598] rounded-lg"
                          title="刪除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Linked Booking Badge */}
                  {item.linkedBookingId && (
                    <div className="flex items-center justify-between bg-[#F0F7F4] px-3 py-1.5 rounded-xl border border-[#C2E2D0] text-xs">
                      <div className="flex items-center gap-1.5 text-[#447A5C] font-bold text-[11px]">
                        <Sparkles className="w-3 h-3 text-[#8BBF9F] shrink-0" />
                        <span>
                          {item.linkedBookingType === 'flight' && '✈️ 來自「機票預訂」自動連動'}
                          {item.linkedBookingType === 'hotel' && '🏨 來自「住宿預訂」自動連動'}
                          {item.linkedBookingType === 'car' && '🚗 來自「租車預約」自動連動'}
                          {item.linkedBookingType === 'voucher' && '🎟️ 來自「票券憑證」自動連動'}
                          {!item.linkedBookingType && '🔗 來自預訂管理自動連動'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('bookings')}
                        className="text-[10px] font-bold text-[#447A5C] hover:underline flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-lg border border-[#C2E2D0]"
                      >
                        <span>查看預訂</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  {/* Receipt Preview */}
                  {item.receiptUrl && (
                    <div className="h-28 rounded-xl overflow-hidden border border-[#E0DACB]">
                      <img 
                        src={item.receiptUrl} 
                        alt="收據明細" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  {/* Split members pills */}
                  <div className="flex items-center justify-between text-[11px] text-[#8E8A81] pt-1.5 border-t border-[#F0ECE1]">
                    <div className="flex items-center gap-1 truncate">
                      <span className="text-[10px]">平攤成員 ({item.splitMemberIds.length}人):</span>
                      <div className="flex items-center gap-1">
                        {item.splitMemberIds.map(mId => {
                          const m = members.find(mem => mem.id === mId);
                          return (
                            <span key={mId} className="px-2 py-0.5 bg-[#FAF8F3] border border-[#E8E5D8] rounded-lg text-[10px] font-bold text-[#5D574F]">
                              {m?.name.split(' ')[0]}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {item.notes && (
                      <span className="text-[10px] text-[#8E8A81] truncate max-w-[120px]">
                        💬 {item.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Add / Edit Expense Modal with Custom Numeric Inputs */}
      {modalOpen && (
        <div 
          id="expense-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-[28px] p-5 sm:p-6 shadow-[6px_6px_0px_#E0E5D5] border-2 border-[#E8E5D8] relative my-6 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0ECE1]">
              <h3 className="text-base font-bold text-[#5D574F]">
                {editingExpense ? '編輯記帳項目' : '新增支出記帳'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-[#FAF8F3] text-[#8E8A81] hover:bg-[#EFECE2] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Amount Display & Currency Selector */}
              <div className="p-3.5 bg-[#FAF8F3] rounded-[22px] border-2 border-[#E8E5D8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8E8A81]">支出金額</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, currency: tripSettings.foreignCurrency, exchangeRate: tripSettings.exchangeRate })}
                      className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all ${
                        formData.currency === tripSettings.foreignCurrency 
                          ? 'bg-[#8BBF9F] text-white shadow-xs' 
                          : 'bg-white border border-[#E8E5D8] text-[#5D574F]'
                      }`}
                    >
                      {tripSettings.foreignCurrency}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, currency: tripSettings.baseCurrency, exchangeRate: 1.0 })}
                      className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all ${
                        formData.currency === tripSettings.baseCurrency 
                          ? 'bg-[#8BBF9F] text-white shadow-xs' 
                          : 'bg-white border border-[#E8E5D8] text-[#5D574F]'
                      }`}
                    >
                      {tripSettings.baseCurrency}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#8BBF9F]">{formData.currency === 'JPY' ? '¥' : '$'}</span>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-2xl font-black text-[#5D574F] bg-transparent focus:outline-none placeholder:text-[#C5BEAF]"
                    required
                    autoFocus
                  />
                </div>

                {formData.currency !== tripSettings.baseCurrency && formData.amount && (
                  <p className="text-[10px] font-bold text-[#8BBF9F] border-t border-[#E8E5D8] pt-1.5 flex items-center justify-between">
                    <span>≈ NT$ {Math.round((parseFloat(formData.amount) || 0) * formData.exchangeRate).toLocaleString()}</span>
                    <span className="text-[#8E8A81] font-normal">(匯率 1 {formData.currency} = {formData.exchangeRate})</span>
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-[#5D574F] mb-1">項目名稱</label>
                <input
                  type="text"
                  placeholder="例如：拉麵午餐、HARUKA 乘車券、藥妝採購"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#FAF8F3] border-2 border-[#E8E5D8] focus:outline-none focus:border-[#8BBF9F] font-bold text-sm text-[#5D574F]"
                  required
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">類別</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {EXPENSE_CATEGORIES.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border font-bold text-xs transition-all ${
                          isSelected
                            ? 'ring-2 ring-[#5C8984] scale-[1.02] bg-[#E8F1EF] text-[#5C8984] border-[#5C8984]'
                            : 'bg-[#FAF8F3] text-[#6D6257] border-[#DDD7C8]'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payer Selector */}
              <PayerSelectGrid
                members={members}
                selectedPayerId={formData.payerId}
                onSelectPayer={(payerId) => setFormData({ ...formData, payerId })}
                label="由誰先代付 (付款人)"
              />

              {/* Split Members Checkbox */}
              <SplitMembersSelectGrid
                members={members}
                selectedMemberIds={formData.splitMemberIds}
                onChangeSelectedIds={(splitMemberIds) => setFormData({ ...formData, splitMemberIds })}
                label="分攤成員"
                totalAmount={parseFloat(formData.amount) || 0}
                currency={formData.currency}
              />

              {/* Date */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">消費日期</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">備註說明 (選填)</label>
                <input
                  type="text"
                  placeholder="備註資訊..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5C8984] hover:bg-[#4E7672] text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
                >
                  {editingExpense ? '儲存修改' : '確認新增記帳'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
