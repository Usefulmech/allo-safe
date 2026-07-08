import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SwipeableItem = ({ children, onEdit, onDelete }: { children: React.ReactNode; onEdit: () => void; onDelete: () => void }) => {
  const [translateX, setTranslateX] = useState(0);
  const startXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startXRef.current;
    if (diff < 0 && diff > -160) setTranslateX(diff);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - startXRef.current;
    setTranslateX(diff < -80 ? -160 : 0);
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-outline-variant/30">
      <div className="absolute right-0 top-0 h-full flex">
        <button onClick={onEdit} className="bg-primary text-white w-20 flex flex-col items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span className="text-[10px] font-bold">EDIT</span>
        </button>
        <button onClick={onDelete} className="bg-danger text-white w-20 flex flex-col items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[18px]">delete</span>
          <span className="text-[10px] font-bold">DELETE</span>
        </button>
      </div>
      <div
        className="relative z-10 bg-white p-4 transition-transform duration-300 ease-out cursor-pointer active:bg-surface-container"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setTranslateX(0)}
      >
        {children}
      </div>
    </div>
  );
};

export default function LedgerHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [transactions] = useState([
    { id: 1, title: 'Whole Grain Rice', meta: '5 Bags • 2 mins ago', amount: '₦145,000', type: 'Sale', icon: 'arrow_upward', color: 'accent' },
    { id: 2, title: 'Mama Sade (Credit)', meta: '3 Crates Eggs • 1h ago', amount: '₦12,500', type: 'Debt', icon: 'schedule', color: 'danger' },
    { id: 3, title: 'Transport Fare', meta: 'Logistics • 4h ago', amount: '₦5,000', type: 'Expense', icon: 'arrow_downward', color: 'text' },
    { id: 4, title: 'Vegetable Oil', meta: '10 Liters • Yesterday', amount: '₦22,000', type: 'Sale', icon: 'arrow_upward', color: 'accent' }
  ]);

  const filtered = filter === 'All' ? transactions : transactions.filter(tr => tr.type === filter);

  return (
    <div className="text-text-primary min-h-screen font-inter">
      <main className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-primary">{t('navLedger') || 'Ledger History'}</h2>
            <p className="text-sm text-text-secondary">Track your income and expenses</p>
          </div>
          <button
            onClick={() => navigate('/voice')}
            className="hidden md:flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            Add Entry
          </button>
        </div>

        {/* Filter Tabs + Search — side by side on desktop */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Sale', 'Expense', 'Debt'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm flex-shrink-0 active:scale-95 transition-all font-medium ${
                  filter === f ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-surface-container border border-outline-variant/30'
                }`}
              >
                {f === 'All' ? (t('filterAll') || 'All') : f === 'Sale' ? (t('filterSales') || 'Sales') : f === 'Expense' ? (t('filterExpenses') || 'Expenses') : (t('filterDebts') || 'Debts')}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
            <input
              type="text"
              className="w-full h-10 pl-10 pr-4 bg-white border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              placeholder={t('searchPlaceholder') || 'Search...'}
            />
          </div>
        </div>

        {/* Transaction List — 2 column grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.length > 0 ? filtered.map((trx) => (
            <SwipeableItem key={trx.id} onEdit={() => {}} onDelete={() => {}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    trx.color === 'accent' ? 'bg-accent/10' : trx.color === 'danger' ? 'bg-danger-surface' : 'bg-surface-container'
                  }`}>
                    <span className={`material-symbols-outlined text-[18px] ${
                      trx.color === 'accent' ? 'text-accent' : trx.color === 'danger' ? 'text-danger' : 'text-primary'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {trx.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{trx.title}</h3>
                    <p className="text-xs text-text-secondary">{trx.meta}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-semibold ${
                    trx.color === 'accent' ? 'text-accent' : trx.color === 'danger' ? 'text-danger' : 'text-text-primary'
                  }`}>{trx.amount}</p>
                  <span className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase ${
                    trx.color === 'accent' ? 'bg-accent/10 text-accent' : trx.color === 'danger' ? 'bg-danger-surface text-danger' : 'bg-surface-container text-text-secondary'
                  }`}>
                    {trx.type}
                  </span>
                </div>
              </div>
            </SwipeableItem>
          )) : (
            <div className="md:col-span-2 flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-20 h-20 bg-surface-container flex items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-outline-variant text-[40px]">history</span>
              </div>
              <p className="text-sm text-text-secondary">{t('emptyLedger')}</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile FAB */}
      <button
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
        onClick={() => navigate('/voice')}
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>
    </div>
  );
}
