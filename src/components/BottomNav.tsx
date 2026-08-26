import React from 'react';
import { useTrip } from '../context/TripContext';
import { TabType } from '../types';
import { 
  CalendarDays, 
  Ticket, 
  WalletCards, 
  BookHeart, 
  CheckSquare, 
  Users 
} from 'lucide-react';
import { motion } from 'motion/react';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, planningItems, scheduleItems, flightBookings, hotelBookings } = useTrip();

  // Calculate badges
  const pendingTodos = planningItems.filter(p => !p.isCompleted).length;
  const bookingCount = flightBookings.length + hotelBookings.length;

  const tabs: TabItem[] = [
    { id: 'schedule', label: '行程', icon: CalendarDays },
    { id: 'bookings', label: '預訂', icon: Ticket, badge: bookingCount > 0 ? bookingCount : undefined },
    { id: 'expense', label: '記帳', icon: WalletCards },
    { id: 'journal', label: '日誌', icon: BookHeart },
    { id: 'planning', label: '準備', icon: CheckSquare, badge: pendingTodos > 0 ? pendingTodos : undefined },
    { id: 'members', label: '成員', icon: Users }
  ];

  return (
    <nav 
      id="bottom-navigation-container"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-[520px] h-[74px] bg-white rounded-[38px] shadow-[0_10px_35px_rgba(90,80,60,0.12)] flex items-center justify-around px-2 border-4 border-[#F7F4EB] z-40"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all select-none active:scale-95 flex-1 ${
              isActive 
                ? 'text-[#8BBF9F]' 
                : 'text-[#8E8A81] hover:text-[#5D574F]'
            }`}
          >
            <div className="relative flex flex-col items-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-[#8BBF9F] text-white shadow-[2px_2px_0px_#7AA88C]' 
                  : 'bg-transparent text-[#8E8A81] hover:bg-[#F9F7F2]'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>

              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-1 px-1.5 min-w-[17px] h-4 bg-[#E8A598] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs border-2 border-white">
                  {tab.badge}
                </span>
              )}

              <span className={`text-[10px] tracking-tight mt-0.5 leading-none ${
                isActive ? 'font-bold text-[#8BBF9F]' : 'font-medium text-[#8E8A81]'
              }`}>
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
