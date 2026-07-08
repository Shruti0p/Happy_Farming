import { useProgress } from '@react-three/drei';

export function LoadingScreen() {
  const { progress, active } = useProgress();

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: 'monospace',
    }}>
      <div style={{
        fontSize: '2rem', fontWeight: 900, color: '#8bc34a',
        marginBottom: '1rem', letterSpacing: '0.1em',
        textShadow: '0 0 20px rgba(139,195,74,0.5)',
      }}>
        Happy Farming
      </div>
      <div style={{
        width: 240, height: 12, background: '#1a1a2e',
        borderRadius: 6, overflow: 'hidden', border: '2px solid #8bc34a',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: 'linear-gradient(90deg, #689f38, #8bc34a, #aed581)',
          transition: 'width 0.3s ease',
          borderRadius: 4,
        }} />
      </div>
      <div style={{ color: '#d7ccc8', fontSize: '0.75rem', fontWeight: 700 }}>
        Loading... {Math.round(progress)}%
      </div>
    </div>
  );
}
