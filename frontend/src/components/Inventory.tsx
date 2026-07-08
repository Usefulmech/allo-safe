import { useState } from 'react';
import { useTranslation } from 'react-i18next';


export default function Inventory() {
  const { t } = useTranslation();

  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const items = [
    { id: 1, name: 'Honey Beans (Oloyin)', status: 'low', value: '₦24,000', count: 12, unit: 'bags', threshold: 20, goal: 80, pct: 15 },
    { id: 2, name: 'Long Grain Rice', status: 'ok', value: '₦58,500', count: 85, unit: 'bags', threshold: 20, goal: 100, pct: 85 },
    { id: 3, name: 'Vegetable Oil (25L)', status: 'low', value: '₦42,000', count: 3, unit: 'litres', threshold: 10, goal: 25, pct: 30 },
    { id: 4, name: 'Palm Oil (5L)', status: 'ok', value: '₦31,200', count: 60, unit: 'bottles', threshold: 15, goal: 80, pct: 75 },
  ];

  return (
    <div className="text-text-primary min-h-screen font-inter">
      <main className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary">{t('navInventory') || 'Inventory'}</h2>
            <p className="text-sm text-text-secondary">Manage your market items</p>
          </div>
          <button className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 active:scale-95 transition-transform shadow-md text-sm">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            <span>{t('addStock') || 'Add Item'}</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 md:col-span-2">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Inventory Value</span>
            <p className="text-2xl font-bold text-primary mt-1">₦155,700</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Items</span>
            <p className="text-2xl font-bold text-primary mt-1">4</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-danger/30">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Low Stock</span>
            <p className="text-2xl font-bold text-danger mt-1">2 <span className="text-sm">Items</span></p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
          <input
            className="w-full h-12 pl-12 pr-4 bg-white border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all shadow-sm"
            placeholder="Search inventory..."
            type="text"
          />
        </div>

        {/* Inventory Grid — 2 col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-xl shadow-sm border-l-[5px] cursor-pointer active:bg-surface-container transition-colors ${
                item.status === 'low' ? 'border-danger' : 'border-accent'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-base text-primary">{item.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {item.status === 'low' ? (
                      <>
                        <span className="material-symbols-outlined text-danger text-[15px]">warning</span>
                        <span className="text-danger font-bold text-xs uppercase">Running low</span>
                      </>
                    ) : (
                      <span className="text-accent font-bold text-xs uppercase">In Stock</span>
                    )}
                  </div>
                </div>
                <p className="font-bold text-primary text-sm">{item.value}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-text-secondary">
                  <span>{item.count} {item.unit} left</span>
                  <span>{item.status === 'low' ? `Threshold: ${item.threshold}` : `Goal: ${item.goal}`}</span>
                </div>
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${item.status === 'low' ? 'bg-danger' : 'bg-accent'}`}
                    style={{ width: `${item.pct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Voice FAB - mobile only */}
      <button
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40 border-2 border-white/20"
        onClick={() => setIsVoiceActive(true)}
      >
        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
      </button>

      {/* Voice Overlay */}
      <div className={`fixed inset-0 bg-primary/80 backdrop-blur-md z-[60] flex-col items-center justify-center p-6 ${isVoiceActive ? 'flex' : 'hidden'}`}>
        <div className="bg-white w-full max-w-sm rounded-[32px] p-8 flex flex-col items-center shadow-2xl">
          <div className="flex items-end gap-2 h-16 mb-8">
            {[6, 12, 16, 8, 14].map((h, i) => (
              <div key={i} className="w-2 bg-accent rounded-full animate-bounce" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          <h4 className="text-2xl font-bold text-primary mb-2">{t('listening') || 'Listening...'}</h4>
          <p className="text-text-secondary text-center mb-10 italic font-medium">"Add ten bags of Oloyin beans..."</p>
          <button
            className="w-full bg-surface-container text-primary py-4 rounded-2xl font-black active:scale-95 transition-transform"
            onClick={() => setIsVoiceActive(false)}
          >
            {t('cancel') || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
