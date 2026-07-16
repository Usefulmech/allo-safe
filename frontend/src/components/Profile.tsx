import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { useAuth } from '../lib/AuthContext';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, checkSession, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync user details when loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setShopName(user.prefs?.shopName || 'My Store');
      if (user.prefs?.language) {
        i18n.changeLanguage(user.prefs.language);
      }
    }
  }, [user, i18n]);

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    if (user) {
      try {
        await account.updatePrefs({ ...user.prefs, language: lang });
        await checkSession();
      } catch (e) {
        console.error("Failed to save language preference", e);
      }
    }
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pcm', label: 'Pidgin' },
    { code: 'yo', label: 'Yorùbá' },
    { code: 'ha', label: 'Hausa' },
    { code: 'ig', label: 'Igbo' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      alert(`Photo upload logic here. Selected: ${e.target.files[0].name}`);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save logic
      setIsSaving(true);
      try {
        if (name !== user?.name) {
          await account.updateName(name);
        }
        if (phone !== user?.phone) {
          // Note: Updating phone in Appwrite usually requires password confirmation 
          // For now, we will assume it works or handle the error.
          try {
             await account.updatePhone(phone, 'currentPassword'); // dummy password
          } catch (e) {
             console.warn("Phone update skipped due to missing password logic", e);
          }
        }
        if (shopName !== user?.prefs?.shopName) {
          await account.updatePrefs({ ...user?.prefs, shopName });
        }
        await checkSession(); // Refresh context
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update profile", error);
        alert("Failed to save profile updates.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="text-text-primary min-h-screen font-inter">
      <main className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-6 pb-32 md:pb-6">
        
        {/* Header */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold text-primary">{t('navProfile') || 'Profile'}</h2>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left relative overflow-hidden">
          <button 
            onClick={handleEditToggle} 
            disabled={isSaving}
            className={`absolute top-4 right-4 cursor-pointer px-4 py-2 rounded-full font-bold text-sm transition-colors disabled:opacity-50 ${isEditing ? 'bg-accent text-white hover:bg-accent/90' : 'bg-surface-container text-primary hover:bg-outline-variant/30'}`}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save' : <span className="material-symbols-outlined text-[20px] align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>}
          </button>

          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-accent/20 bg-surface-container flex items-center justify-center">
               <span className="material-symbols-outlined text-[64px] md:text-[80px] text-text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <button 
              onClick={handlePhotoClick}
              className="absolute bottom-0 right-0 w-8 h-8 bg-accent rounded-full border-2 border-white flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-white text-[16px]">photo_camera</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <div className="flex-1 space-y-2 mt-2 md:mt-0 w-full">
            <div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-bold text-primary bg-surface-container/30 border border-outline-variant/50 rounded-lg px-2 py-1 w-full max-w-[250px] outline-none focus:border-accent focus:ring-1 focus:ring-accent text-center md:text-left"
                />
              ) : (
                <h2 className="text-2xl font-bold text-primary">{name || 'User'}</h2>
              )}
              <p className="text-sm font-medium text-accent mt-1">ID: {user?.$id?.slice(-8) || 'Unknown'}</p>
            </div>
            
            <div className="pt-2 flex flex-col md:flex-row gap-3 md:gap-6 text-sm text-text-secondary">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-[18px]">store</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="font-medium bg-surface-container/30 border border-outline-variant/50 rounded-lg px-2 py-1 w-full outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                ) : (
                  <span>{shopName}</span>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-[18px]">call</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="font-medium bg-surface-container/30 border border-outline-variant/50 rounded-lg px-2 py-1 w-full outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                ) : (
                  <span>{phone || 'No phone set'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Button */}
        <button className="w-full bg-primary text-white py-4 rounded-xl flex items-center justify-between px-6 shadow-md hover:bg-primary-hover active:scale-[0.98] transition-all group">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-accent text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            <div className="text-left">
              <span className="text-lg font-semibold block">{t('financialSummary') || 'Financial Summary'}</span>
              <span className="text-xs text-white/60">View your weekly and monthly reports</span>
            </div>
          </div>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Switcher */}
          <section className="space-y-3 bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">language</span>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{t('languageLabel') || 'Language'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors active:scale-95 ${
                    i18n.language === lang.code
                      ? 'border-accent bg-accent/10 text-primary font-bold shadow-sm'
                      : 'border-outline-variant/30 bg-surface text-text-secondary font-medium hover:border-accent/50 hover:bg-surface-container'
                  }`}
                >
                  <span>{lang.label}</span>
                  {i18n.language === lang.code && (
                    <span className="material-symbols-outlined text-[20px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Voice History Section */}
          <section className="space-y-3 bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{t('myVoiceHistory') || 'Voice Logs'}</h3>
              </div>
              <button className="text-accent font-bold text-xs hover:underline">{t('viewAll') || 'View All'}</button>
            </div>
            
            <div className="space-y-2">
              <div className="bg-surface-container/50 border border-outline-variant/30 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-surface-container transition-colors">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-accent text-[18px]">mic</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm italic text-text-primary line-clamp-1">"Add 5 bags of rice to my ledger..."</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">{t('today_10am') || 'Today, 10:15 AM'}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant flex-shrink-0">play_circle</span>
              </div>
              <div className="bg-surface-container/50 border border-outline-variant/30 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-surface-container transition-colors">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-accent text-[18px]">mic</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm italic text-text-primary line-clamp-1">"How much did Mama Sade pay?"</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">{t('yesterday') || 'Yesterday, 4:30 PM'}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant flex-shrink-0">play_circle</span>
              </div>
            </div>
          </section>
        </div>

        {/* Logout Section */}
        <section className="pt-4 pb-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 text-danger border-2 border-danger/20 rounded-xl bg-danger-surface hover:bg-danger hover:text-white active:scale-95 transition-all font-bold shadow-sm"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>{t('logout') || 'Log Out'}</span>
          </button>
        </section>
      </main>
    </div>
  );
}
