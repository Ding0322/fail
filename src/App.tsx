/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TripProvider, useTrip } from './context/TripContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PINModal } from './components/PINModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ScheduleTab } from './components/Tabs/ScheduleTab';
import { BookingsTab } from './components/Tabs/BookingsTab';
import { ExpenseTab } from './components/Tabs/ExpenseTab';
import { JournalTab } from './components/Tabs/JournalTab';
import { PlanningTab } from './components/Tabs/PlanningTab';
import { MembersTab } from './components/Tabs/MembersTab';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { activeTab } = useTrip();

  return (
    <div className="min-h-screen flex flex-col max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto relative bg-[#F7F4EB] text-[#5D574F]">
      {/* Top Application Header */}
      <Header />

      {/* Main Tab Content View */}
      <main className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'expense' && <ExpenseTab />}
            {activeTab === 'journal' && <JournalTab />}
            {activeTab === 'planning' && <PlanningTab />}
            {activeTab === 'members' && <MembersTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global PIN Keypad Security Modal */}
      <PINModal />

      {/* Global In-app Confirm Deletion Modal */}
      <ConfirmModal />

      {/* Fixed Bento Floating Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <TripProvider>
      <MainContent />
    </TripProvider>
  );
}
