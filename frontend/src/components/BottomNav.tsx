import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    // Only visible on mobile (md and below)
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-white z-50 rounded-t-xl shadow-[0px_-4px_12px_rgba(0,0,0,0.08)]">
      {/* Home */}
      <Link
        to="/dashboard"
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 active:scale-95 transition-all duration-150 flex-1 ${
          isActive('/dashboard') ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isActive('/dashboard') ? "'FILL' 1" : "'FILL' 0" }}>
          home
        </span>
        <span className="text-[10px] font-medium mt-0.5">{t('navHome')}</span>
      </Link>

      {/* Ledger */}
      <Link
        to="/ledger"
        className={`flex flex-col items-center justify-center active:scale-95 transition-all duration-150 flex-1 ${
          isActive('/ledger') ? 'text-accent' : 'text-text-secondary hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isActive('/ledger') ? "'FILL' 1" : "'FILL' 0" }}>
          menu_book
        </span>
        <span className="text-[10px] font-medium mt-0.5">{t('navLedger')}</span>
      </Link>

      {/* Voice (Prominent Center) */}
      <Link
        to="/voice"
        className="flex flex-col items-center justify-center text-text-secondary active:scale-95 transition-all duration-150 flex-1"
      >
        <div className={`rounded-full w-12 h-12 flex items-center justify-center -mt-6 shadow-lg text-white transition-colors ${
          isActive('/voice') ? 'bg-accent' : 'bg-primary hover:bg-primary-hover'
        }`}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            mic
          </span>
        </div>
        <span className="text-[10px] font-medium mt-0.5">{t('navVoice') || 'Voice'}</span>
      </Link>

      {/* Inventory */}
      <Link
        to="/inventory"
        className={`flex flex-col items-center justify-center active:scale-95 transition-all duration-150 flex-1 ${
          isActive('/inventory') ? 'text-accent' : 'text-text-secondary hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isActive('/inventory') ? "'FILL' 1" : "'FILL' 0" }}>
          inventory_2
        </span>
        <span className="text-[10px] font-medium mt-0.5">{t('navInventory')}</span>
      </Link>
    </nav>
  );
}
