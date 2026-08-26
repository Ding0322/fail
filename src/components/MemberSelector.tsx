import React from 'react';
import { Member } from '../types';
import { Check, CheckSquare, Square, Users, CreditCard } from 'lucide-react';

interface MemberAvatarProps {
  member?: Member | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({ 
  member, 
  size = 'sm',
  className = '' 
}) => {
  if (!member) {
    return (
      <div className={`rounded-full bg-[#FAF8F3] border border-[#E8E5D8] flex items-center justify-center text-xs text-[#8E8A81] ${
        size === 'xs' ? 'w-5 h-5 text-[10px]' :
        size === 'sm' ? 'w-7 h-7 text-xs' :
        size === 'md' ? 'w-9 h-9 text-sm' :
        'w-12 h-12 text-base'
      } ${className}`}>
        👤
      </div>
    );
  }

  const isImageUrl = member.avatar && (
    member.avatar.startsWith('http://') || 
    member.avatar.startsWith('https://') || 
    member.avatar.startsWith('data:image') ||
    member.avatar.startsWith('/')
  );

  const sizeClasses = 
    size === 'xs' ? 'w-5 h-5 text-[10px]' :
    size === 'sm' ? 'w-7 h-7 text-xs' :
    size === 'md' ? 'w-9 h-9 text-sm' :
    'w-12 h-12 text-base';

  if (isImageUrl) {
    return (
      <img
        src={member.avatar}
        alt={member.name}
        referrerPolicy="no-referrer"
        className={`${sizeClasses} rounded-full object-cover border border-[#E8E5D8] bg-[#FAF8F3] shrink-0 ${className}`}
      />
    );
  }

  return (
    <div 
      className={`${sizeClasses} rounded-full flex items-center justify-center border border-[#E8E5D8] bg-[#FAF8F3] shrink-0 font-medium ${className}`}
    >
      <span>{member.avatar || '👤'}</span>
    </div>
  );
};

interface PayerSelectGridProps {
  members: Member[];
  selectedPayerId: string;
  onSelectPayer: (memberId: string) => void;
  label?: string;
}

export const PayerSelectGrid: React.FC<PayerSelectGridProps> = ({
  members,
  selectedPayerId,
  onSelectPayer,
  label = '由誰先代付 (付款人)'
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block font-bold text-[#5D574F] text-xs flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-[#8BBF9F]" />
          <span>{label}</span>
          <span className="text-[10px] text-[#8E8A81] font-normal">(點選指派)</span>
        </label>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {members.map((m) => {
          const isSelected = selectedPayerId === m.id;
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => onSelectPayer(m.id)}
              className={`flex items-center gap-2 p-2 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[#E5F2D5] border-[#8BBF9F] shadow-[2px_2px_0px_#8BBF9F] text-[#447A5C] font-bold'
                  : 'bg-white hover:bg-[#FAF8F3] border-[#E8E5D8] text-[#5D574F]'
              }`}
            >
              <div className="relative shrink-0">
                <MemberAvatar member={m} size="sm" />
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#8BBF9F] text-white rounded-full flex items-center justify-center border border-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate leading-tight">{m.name}</p>
                <p className="text-[10px] text-[#8E8A81] truncate">{m.role || '成員'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface SplitMembersSelectGridProps {
  members: Member[];
  selectedMemberIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  label?: string;
  totalAmount?: number;
  currency?: string;
}

export const SplitMembersSelectGrid: React.FC<SplitMembersSelectGridProps> = ({
  members,
  selectedMemberIds,
  onChangeSelectedIds,
  label = '分攤成員',
  totalAmount,
  currency
}) => {
  const allIds = members.map(m => m.id);
  const isAllSelected = allIds.length > 0 && allIds.every(id => selectedMemberIds.includes(id));

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      // Keep at least one selected if desired or allow 0
      onChangeSelectedIds(selectedMemberIds.filter(mId => mId !== id));
    } else {
      onChangeSelectedIds([...selectedMemberIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      // If all are selected, uncheck all (or reset to empty)
      onChangeSelectedIds([]);
    } else {
      onChangeSelectedIds(allIds);
    }
  };

  const perPersonAmount = (totalAmount && selectedMemberIds.length > 0)
    ? Math.round(totalAmount / selectedMemberIds.length)
    : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="font-bold text-[#5D574F] text-xs flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#8BBF9F]" />
          <span>{label} ({selectedMemberIds.length} / {members.length} 人)</span>
        </label>
        <div className="flex items-center gap-2">
          {perPersonAmount !== null && currency && (
            <span className="text-[10px] text-[#8E8A81]">
              每人約 <strong className="text-[#E8A598] font-bold">{perPersonAmount.toLocaleString()} {currency}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[11px] font-bold text-[#447A5C] bg-[#E5F2D5] hover:bg-[#D5E8C0] px-2 py-0.5 rounded-lg border border-[#C2E2D0] active:scale-95 transition-all"
          >
            {isAllSelected ? '清空' : '全選所有人'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {members.map((m) => {
          const isSelected = selectedMemberIds.includes(m.id);
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => toggleMember(m.id)}
              className={`flex items-center gap-2 p-2 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[#F0F7F4] border-[#8BBF9F] text-[#447A5C] font-bold shadow-[2px_2px_0px_#8BBF9F]'
                  : 'bg-white hover:bg-[#FAF8F3] border-[#E8E5D8] text-[#8E8A81] opacity-75'
              }`}
            >
              <div className="shrink-0 text-[#8BBF9F]">
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-[#8BBF9F]" />
                ) : (
                  <Square className="w-4 h-4 text-[#C5BEAF]" />
                )}
              </div>
              <MemberAvatar member={m} size="xs" />
              <span className="text-xs font-bold truncate leading-tight flex-1">
                {m.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
