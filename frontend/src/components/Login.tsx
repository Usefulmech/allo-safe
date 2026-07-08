import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendPin = () => {
    if (phone.length < 10) return;
    setStep('otp');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // limit to 1 char
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    } else if (value !== '' && index === 3) {
      // Complete
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div 
      className="min-h-screen font-inter flex flex-col relative bg-primary"
      style={{
        backgroundImage: "url('/bg-market.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability - made lighter so the background is less faded */}
      <div className="absolute inset-0 bg-primary/60 lg:bg-gradient-to-r lg:from-primary/80 lg:to-primary/20"></div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-6xl w-full mx-auto px-6 py-12 gap-12 lg:gap-24">
        
        {/* Left Side: Hero Information */}
        <div className="flex-1 text-white text-center lg:text-left pt-8 lg:pt-0">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-6 shadow-lg shadow-accent/30">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight">
            AlloSafe
          </h1>
          <h2 className="text-xl lg:text-2xl font-medium text-surface-variant mb-6">
            The Voice-Powered Ledger for Your Business
          </h2>
          <p className="text-base lg:text-lg text-outline-variant max-w-md mx-auto lg:mx-0 leading-relaxed mb-8">
            Just speak your daily sales, expenses, and debts. AlloSafe instantly translates your voice into a secure digital ledger, tracks your stock, and builds the reliable financial history you need to unlock new opportunities.
          </p>
          <div className="hidden lg:flex items-center gap-2 text-accent font-bold bg-white/10 w-fit px-5 py-2.5 rounded-full backdrop-blur-sm text-lg">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
            <span>{t('loginSubtitle') || 'Track Your Business. Unlock Opportunities.'}</span>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[24px] shadow-2xl p-8 border border-white/20">
          <header className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-primary mb-2 tracking-tight">
              {t('loginTitle')}
            </h3>
            <p className="text-text-secondary font-medium">
              {t('loginSubtitle')}
            </p>
          </header>

          {/* Step 1: Phone Input */}
          {step === 'phone' && (
            <div className="space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary block tracking-wide" htmlFor="phone">
                  {t('phoneLabel')}
                </label>
                <div className="flex items-center bg-surface-container border border-outline-variant/40 rounded-xl focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 overflow-hidden transition-all h-14 shadow-sm">
                  <span className="pl-4 pr-2 font-bold text-primary border-r border-outline-variant/40">+234</span>
                  <input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="801 234 5678"
                    className="bg-transparent border-none focus:ring-0 w-full text-xl tracking-widest placeholder:text-outline-variant/60 placeholder:font-normal outline-none px-3"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleSendPin}
                className="w-full h-14 rounded-xl bg-primary text-white font-semibold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg hover:bg-primary-hover hover:shadow-xl"
              >
                <span>{t('sendPin')}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 2: OTP Input */}
          {step === 'otp' && (
            <div className="space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="space-y-2 text-center">
                <label className="text-sm font-semibold text-text-secondary block tracking-wide">
                  {t('otpLabel')}
                </label>
                <div className="flex justify-between gap-2 max-w-[280px] mx-auto py-4">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="number"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-14 h-16 text-center text-2xl font-bold bg-surface-container border border-outline-variant/40 rounded-xl appearance-none focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none shadow-inner transition-all"
                    />
                  ))}
                </div>
                <button
                  className="text-accent font-medium text-sm mt-2 active:opacity-70 transition-opacity hover:underline"
                  onClick={() => alert('PIN resent!')}
                >
                  Resend PIN
                </button>
              </div>
              <button
                className="w-full text-center text-sm text-text-secondary underline py-2 hover:text-primary transition-colors"
                onClick={() => setStep('phone')}
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Area */}
      <footer className="relative z-10 w-full py-6 mt-auto border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© 2026 AlloSafe. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors hover:underline">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* Voice Call/Mic Tooltip Anchor */}
      <div className="fixed bottom-24 lg:bottom-12 right-6 z-50">
        {/* Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-4 w-56 p-4 bg-white text-primary text-sm font-medium rounded-xl shadow-2xl transition-all duration-500 transform ${
            showTooltip ? 'opacity-100 translate-y-0 animate-bounce' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <span>{t('firstLoginTooltip')}</span>
          <div className="absolute top-full right-6 border-8 border-transparent border-t-white"></div>
        </div>
        {/* Voice FAB */}
        <button
          onClick={toggleTooltip}
          className="w-16 h-16 rounded-full bg-accent text-white shadow-[0_0_20px_rgba(212,136,15,0.4)] flex items-center justify-center active:scale-90 transition-all hover:opacity-90 hover:shadow-[0_0_25px_rgba(212,136,15,0.6)]"
        >
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            mic
          </span>
        </button>
      </div>

      {/* Success Overlay */}
      <div
        className={`fixed inset-0 bg-primary/95 z-[100] flex flex-col items-center justify-center text-white transition-opacity duration-500 backdrop-blur-md ${
          showSuccess ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[96px] mb-8 animate-pulse text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <h2 className="text-4xl font-bold mb-3 tracking-tight">{t('successLogged')}</h2>
        <p className="text-xl text-surface-variant/80">Opening your ledger...</p>
      </div>
    </div>
  );
}
