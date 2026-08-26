import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { 
  Sparkles, 
  Settings, 
  MapPin, 
  Calendar, 
  UserCheck, 
  RefreshCw, 
  Plane,
  ChevronDown
} from 'lucide-react';
import { TripSettingsModal } from './TripSettingsModal';

export const Header: React.FC = () => {
  const { 
    tripSettings, 
    members, 
    currentMemberId, 
    setCurrentMemberId, 
    daysRemaining, 
    triggerConfetti 
  } = useTrip();

  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState<boolean>(false);

  const currentMember = members.find(m => m.id === currentMemberId) || members[0];

  // Countdown text formatting
  const getCountdownBadge = () => {
    if (daysRemaining > 0) {
      return `✈️ 倒數 ${daysRemaining} 天`;
    } else if (daysRemaining === 0) {
      return `🎉 就是今天！出發！`;
    } else {
      return `🍁 行程進行中！`;
    }
  };

  return (
    <>
      <header 
        id="app-header" 
        className="w-full bg-[#F7F4EB] sticky top-0 z-30 px-4 sm:px-6 py-4"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Bento Style App Title & Icon */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div 
              onClick={triggerConfetti}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-[#8BBF9F] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#E0E5D5] shrink-0 cursor-pointer active:scale-95 transition-transform text-xl text-white select-none hover:bg-[#7AA88C]"
              title="點擊撒花！"
            >
              🍃
            </div>

            <div className="truncate">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#5D574F] truncate">
                  {tripSettings.title}
                </h1>
                <span className="text-[11px] sm:text-xs bg-[#E8A598] text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs shrink-0">
                  {daysRemaining > 0 ? `D-${daysRemaining}` : daysRemaining === 0 ? 'D-Day' : '旅行中'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8E8A81] mt-0.5">
                <span className="flex items-center gap-1 font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#8BBF9F] shrink-0" />
                  {tripSettings.destination}
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#D5CFBF]" />
                <span className="text-[11px] font-medium text-[#7D766C]">
                  {tripSettings.startDate} ~ {tripSettings.endDate}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Bento Member Stack & Settings */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Overlapping Bento Avatar Stack with Switcher trigger */}
            <div className="relative">
              <button
                id="member-switcher-btn"
                onClick={() => setMemberMenuOpen(!memberMenuOpen)}
                className="flex items-center -space-x-2 bg-white/80 hover:bg-white p-1 rounded-full border-2 border-[#E8E5D8] shadow-[2px_2px_0px_#E0E5D5] active:scale-95 transition-all"
                title="切換旅伴成員"
              >
                {members.slice(0, 3).map((m, idx) => (
                  <div 
                    key={m.id} 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#F7F4EB] bg-white overflow-hidden shrink-0 shadow-xs"
                    style={{ zIndex: 3 - idx }}
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {members.length > 3 && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#F7F4EB] bg-[#8BBF9F] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                    +{members.length - 3}
                  </div>
                )}
              </button>

              {/* Member dropdown menu */}
              {memberMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMemberMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white border-2 border-[#E0E5D5] rounded-3xl p-3 shadow-[6px_6px_0px_#E0E5D5] z-50 animate-in fade-in zoom-in-95 duration-100">
                    <p className="text-[10px] font-bold text-[#8E8A81] px-2 py-1 uppercase tracking-wider">
                      切換目前操作成員
                    </p>
                    <div className="space-y-1 mt-1">
                      {members.map((m) => (
                        <button
                          key={m.id}
                          id={`select-user-${m.id}`}
                          onClick={() => {
                            setCurrentMemberId(m.id);
                            setMemberMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-2xl text-left text-xs transition-all ${
                            m.id === currentMemberId 
                              ? 'bg-[#E5F2D5] text-[#5D574F] font-bold border border-[#8BBF9F]/40' 
                              : 'hover:bg-[#F9F7F2] text-[#5D574F]'
                          }`}
                        >
                          <img
                            src={m.avatar}
                            alt={m.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full border border-[#D5CFBF]"
                          />
                          <div className="truncate flex-1">
                            <div className="font-bold truncate text-[#5D574F]">{m.name}</div>
                            <div className="text-[10px] text-[#8E8A81] truncate">{m.role}</div>
                          </div>
                          {m.id === currentMemberId && (
                            <UserCheck className="w-4 h-4 text-[#8BBF9F] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings Button */}
            <button
              id="open-settings-btn"
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-[#F9F7F2] border-2 border-[#E8E5D8] rounded-2xl text-[#5D574F] flex items-center justify-center shadow-[3px_3px_0px_#E0E5D5] active:scale-95 transition-all"
              title="旅程設定"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <TripSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};
