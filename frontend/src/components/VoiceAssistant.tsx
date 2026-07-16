import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function VoiceAssistant() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    if (isProcessing) return;
    setErrorMsg(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setErrorMsg("Microphone access is required to use this feature.");
    }
  };

  const handleStopRecording = () => {
    if (!isListening || !mediaRecorderRef.current) return;
    
    setIsListening(false);
    setIsProcessing(true);
    
    const mediaRecorder = mediaRecorderRef.current;
    
    mediaRecorder.onstop = async () => {
      // Stop all tracks to release microphone
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      if (!user) {
        setErrorMsg("You must be logged in to record.");
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('user_id', user.$id);
      formData.append('phone_number', user.phone || 'unknown');

      try {
        // We call the backend FastAPI endpoint directly.
        // Assuming backend is running on localhost:8000 for local dev
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${BACKEND_URL}/api/pwa/process-audio`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process audio');
        }

        // Processing success! Navigate back to ledger
        navigate('/ledger');
      } catch (err) {
        console.error("Audio upload error", err);
        setErrorMsg("Failed to process your recording. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };

    mediaRecorder.stop();
  };

  return (
    <div className="text-text-primary min-h-screen font-inter">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-[calc(100vh-64px)]">
        {/* Instructional Header */}
        <div className="text-center mb-10 max-w-sm">
          <h2 className="text-2xl font-bold text-primary mb-2">Record Trade</h2>
          <p className="text-text-secondary text-sm opacity-80">
            Tell AlloSafe what happened: "Sold 2 bags of rice for 40,000 to Musa"
          </p>
          {errorMsg && (
            <p className="text-danger text-sm font-bold mt-4 px-4 py-2 bg-danger-surface rounded-lg">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Interaction Area */}
        <div className="relative w-full flex items-center justify-center mb-6" style={{ maxWidth: 320, aspectRatio: '1' }}>
          {/* Voice Button */}
          <button
            onMouseDown={handleStartRecording}
            onMouseUp={handleStopRecording}
            onMouseLeave={() => { if (isListening) handleStopRecording(); }}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
            className={`relative z-10 text-white rounded-full w-56 h-56 flex flex-col items-center justify-center shadow-xl active:scale-95 touch-none select-none transition-all duration-300 ${
              isListening ? 'bg-[#2A2520]' : isProcessing ? 'bg-[#1A1A1A] shadow-[0_0_40px_rgba(212,136,15,0.2)]' : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            <div className={`flex flex-col items-center justify-center transition-opacity duration-300 ${isProcessing ? 'opacity-0' : 'opacity-100'}`}>
              <span className="material-symbols-outlined text-[64px] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                mic
              </span>
              <span className="text-sm tracking-widest uppercase font-bold">
                {t('holdToSpeak') || 'AlloSafe'}
              </span>
            </div>
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[80px] text-accent animate-[spin_1s_linear_infinite]">
                  progress_activity
                </span>
              </div>
            )}
          </button>

          {/* Ripple ring */}
          <div className={`absolute inset-0 rounded-full pointer-events-none transition-all duration-300 ${
            isListening ? 'ring-4 ring-accent/20 scale-110 opacity-100' : isProcessing ? 'ring-[24px] ring-accent/15 scale-110 opacity-100' : 'opacity-0'
          }`}></div>
        </div>

        {/* Status label */}
        <div className="h-8 flex items-center justify-center mt-2">
          <p className={`text-sm uppercase tracking-widest transition-all duration-300 ${
            isListening ? 'text-accent font-bold' : 'text-text-secondary'
          }`}>
            {isListening ? (t('listening') || 'Listening...') : isProcessing ? (t('understanding') || 'Understanding...') : (t('holdToSpeak') || 'Hold to speak')}
          </p>
        </div>

        {/* Type instead */}
        <div className="mt-10">
          <button className="flex items-center gap-2 text-primary text-sm hover:underline decoration-accent decoration-2 underline-offset-4 px-6 py-4 transition-colors rounded-xl bg-white border border-outline-variant/30 shadow-sm">
            <span className="material-symbols-outlined text-xl">keyboard</span>
            <span>{t('typeInstead')}</span>
          </button>
        </div>
      </main>

      {/* Voice Feedback Sheet */}
      <div className={`fixed left-0 w-full bg-white shadow-[0px_-8px_32px_rgba(0,0,0,0.15)] rounded-t-[40px] transition-all duration-500 ease-out z-[60] px-6 pt-8 pb-20 ${
        isListening || isProcessing ? 'bottom-0' : '-bottom-full'
      }`}>
        <div className="w-16 h-1.5 bg-surface-container rounded-full mx-auto mb-6"></div>
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
              <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
            </div>
            <p className="text-xl font-semibold text-primary">
              {isProcessing ? (t('understanding') || 'Understanding...') : (t('listening') || 'Listening...')}
            </p>
          </div>
          <p className="text-text-secondary text-base text-center italic px-4">
            "I sold 3 liters of palm oil for..."
          </p>
        </div>
      </div>
    </div>
  );
}
