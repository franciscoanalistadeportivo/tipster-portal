'use client';

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📡</div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#F1F5F9',
          marginBottom: '12px',
        }}>
          Sin conexión
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#94A3B8',
          marginBottom: '32px',
          lineHeight: '1.6',
        }}>
          Parece que no tienes conexión a internet. Verifica tu red y vuelve a intentar.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'linear-gradient(135deg, #00D1B2, #00B89C)',
            color: 'white',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 209, 178, 0.3)',
          }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
