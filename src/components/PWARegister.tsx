'use client';

import { useEffect, useState } from 'react';

export default function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('[PWA] Service Worker registrado:', reg.scope);
      }).catch((err) => {
        console.log('[PWA] Error SW:', err);
      });
    }

    // Capturar prompt de instalación
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Solo mostrar banner si no está instalada
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setTimeout(() => setShowBanner(true), 3000); // Mostrar después de 3s
      }
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log('[PWA] Install:', outcome);
    setInstallPrompt(null);
    setShowBanner(false);
  };

  const isStandalone = typeof window !== 'undefined' && 
    window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone || !showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: 'calc(100% - 32px)',
      maxWidth: '420px',
      animation: 'slideUp 0.4s ease-out',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #253347 100%)',
        border: '1px solid rgba(0, 209, 178, 0.4)',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 209, 178, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <div style={{ fontSize: '32px', flexShrink: 0 }}>🧠</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            color: '#F1F5F9', 
            fontWeight: 700, 
            fontSize: '14px',
            marginBottom: '2px',
          }}>
            Instalar NeuroTips
          </div>
          <div style={{ color: '#94A3B8', fontSize: '12px' }}>
            Accede rápido desde tu pantalla de inicio
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={handleInstall}
            style={{
              background: 'linear-gradient(135deg, #00D1B2, #00B89C)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Instalar
          </button>
          <button
            onClick={() => setShowBanner(false)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#94A3B8',
              border: 'none',
              padding: '8px 10px',
              borderRadius: '10px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(30px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
