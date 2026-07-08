import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function MobileHeader() {
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    const langs = ['en', 'pcm', 'yo', 'ha', 'ig'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextLang = langs[(currentIndex + 1) % langs.length];
    i18n.changeLanguage(nextLang);
  };

  return (
    // Only visible on mobile (md and below)
    <header className="md:hidden w-full top-0 sticky bg-white shadow-sm z-50 border-b border-outline-variant/30">
      <div className="flex items-center justify-between px-4 py-3 w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">AlloSafe</h1>
        </div>

        {/* Language and Profile Avatar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={changeLanguage}
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-container bg-surface-container/50 transition-colors active:scale-95 rounded-full"
            title="Change Language"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">language</span>
          </button>

          <Link to="/profile" className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border-2 border-surface-container flex items-center justify-center active:scale-95 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[22px] text-text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
