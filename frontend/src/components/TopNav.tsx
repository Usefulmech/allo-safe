import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export default function TopNav() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const changeLanguage = () => {
    const langs = ['en', 'pcm', 'yo', 'ha', 'ig'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextLang = langs[(currentIndex + 1) % langs.length];
    i18n.changeLanguage(nextLang);
  };

  const navLinks = [
    { to: '/dashboard', label: t('navHome'), icon: 'home' },
    { to: '/ledger', label: t('navLedger'), icon: 'menu_book' },
    { to: '/voice', label: t('navVoice') || 'Voice', icon: 'mic' },
    { to: '/inventory', label: t('navInventory'), icon: 'inventory_2' },
  ];

  return (
    // Only visible on desktop (md and up)
    <header className="hidden md:flex w-full top-0 sticky bg-white border-b border-outline-variant/30 z-50 shadow-sm">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-8 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">AlloSafe</span>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 ${
                isActive(to)
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-primary hover:bg-surface-container'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive(to) ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Voice Quick Action Button */}
          <Link
            to="/voice"
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
            Record Trade
          </Link>

          {/* Language toggle */}
          <button
            onClick={changeLanguage}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container text-text-secondary transition-colors"
            title="Change Language"
          >
            <span className="material-symbols-outlined text-[20px]">language</span>
          </button>

          {/* Profile Avatar */}
          <Link to="/profile" className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/30 hover:border-accent/50 transition-colors">
            <span className="material-symbols-outlined text-[20px] text-text-secondary">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
