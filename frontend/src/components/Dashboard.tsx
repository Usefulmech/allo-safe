import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="text-text-primary min-h-screen font-inter">
      <main className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Greeting Section */}
        <section className="flex flex-col gap-1">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {t('greeting', { name: 'Baba Tunde' })}
          </p>
          <h2 className="text-2xl font-semibold text-primary">Your Daily Ledger</h2>
        </section>

        {/* Desktop: 2-col layout — Net Position card + Stats side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Net Position Card */}
          <section className="md:col-span-2 bg-primary p-8 rounded-2xl shadow-md text-white relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[140px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium uppercase tracking-widest text-white/60">
                  {t('netPosition')}
                </span>
                <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  LIVE
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-5xl font-light text-accent drop-shadow-sm">₦127,500.00</h3>
                <div className="flex items-center gap-1 mt-2 text-white/60">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-xs font-medium">Steady growth this week</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats — stacked on desktop right column, row on mobile */}
          <section className="flex flex-col gap-3">
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border-l-4 border-accent">
              <div className="w-10 h-10 rounded-full bg-success-surface flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </div>
              <div>
                <span className="text-xs font-medium text-text-secondary block">{t('thisWeekIncome')}</span>
                <span className="text-lg font-bold text-accent">₦85k</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border-l-4 border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </div>
              <div>
                <span className="text-xs font-medium text-text-secondary block">{t('thisWeekExpense')}</span>
                <span className="text-lg font-bold text-text-primary">₦42k</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border-l-4 border-danger">
              <div className="w-10 h-10 rounded-full bg-danger-surface flex items-center justify-center text-danger flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">emergency_home</span>
              </div>
              <div>
                <span className="text-xs font-medium text-text-secondary block">{t('peopleOwing')}</span>
                <span className="text-lg font-bold text-danger">₦18k</span>
              </div>
            </div>
          </section>
        </div>

        {/* Voice Activation Prompt */}
        <section
          className="bg-accent/10 border border-accent/30 p-4 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform hover:bg-accent/15"
          onClick={() => navigate('/voice')}
        >
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-50"></div>
              <div className="relative w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-primary">"Sold 5 bags of rice"</h4>
              <p className="text-xs text-text-secondary">Tap here to record your trade</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-accent">chevron_right</span>
        </section>

        {/* Recent Activity List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">{t('recentActivity')}</h3>
            <button className="text-accent text-xs font-medium hover:underline px-2" onClick={() => navigate('/ledger')}>
              {t('viewAll')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Activity Item 1 */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-accent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">mic</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Musa Textiles Ltd</p>
                  <p className="text-xs text-text-secondary">2 mins ago • Voice</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-accent">+₦15,000</p>
                <span className="inline-block px-2 py-0.5 bg-accent/20 text-accent rounded text-[10px] font-bold uppercase">PAID</span>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-text-secondary text-[18px]">keyboard</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Store Rent (Part)</p>
                  <p className="text-xs text-text-secondary">1 hour ago • Typed</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-text-secondary">-₦25,000</p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-danger md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">mic</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Alhaji Sani (Debt)</p>
                  <p className="text-xs text-text-secondary">3 hours ago • Voice</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-danger">₦8,000</p>
                <span className="inline-block px-2 py-0.5 bg-danger-surface text-danger rounded text-[10px] font-bold uppercase">OWED</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FAB — only on mobile */}
      <button
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
        onClick={() => navigate('/voice')}
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>
    </div>
  );
}
