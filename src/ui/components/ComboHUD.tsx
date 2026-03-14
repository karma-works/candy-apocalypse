import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/state/gameStore';

export function ComboHUD() {
  const comboLabel = useGameStore((state) => state.comboLabel);
  const kills = useGameStore((state) => state.kills);
  const score = useGameStore((state) => state.score);
  const clearComboLabel = useGameStore((state) => state.clearComboLabel);
  const [ visibleLabel, setVisibleLabel ] = useState('');
  const [ showCombo, setShowCombo ] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!comboLabel) {
      return;
    }
    setVisibleLabel(comboLabel);
    setShowCombo(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowCombo(false);
      clearComboLabel();
    }, 1500);
  }, [ comboLabel, clearComboLabel ]);

  return (
    <>
      {/* Score and kill counter — top left */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '20px',
          pointerEvents: 'none',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
          fontFamily: '\'Courier New\', monospace',
          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ fontSize: '1.4rem', color: '#FFE135', fontWeight: 'bold' }}>
                    ⭐ {score.toLocaleString()}
        </div>
        <div style={{ fontSize: '1rem', color: '#FFB7C5' }}>
                    💀 {kills} kill{kills !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Combo popup — centre screen */}
      {showCombo &&
                <div
                  style={{
                    position: 'fixed',
                    top: '30%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    zIndex: 60,
                    animation: 'comboPopIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
                  }}
                >
                  {/* Speech bubble */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #FFE135, #FF6B35)',
                      border: '4px solid #1A1A2E',
                      borderRadius: '18px',
                      padding: '14px 28px',
                      position: 'relative',
                      boxShadow: '4px 6px 0 #1A1A2E',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                        fontWeight: '900',
                        color: '#1A1A2E',
                        fontFamily: '\'Courier New\', monospace',
                        letterSpacing: '0.06em',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {visibleLabel}
                    </div>
                    {/* Bubble tail */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '14px solid transparent',
                        borderRight: '14px solid transparent',
                        borderTop: '16px solid #1A1A2E',
                      }}
                    />
                  </div>
                </div>
      }

      {/* Keyframe style injected once */}
      <style>{`
                @keyframes comboPopIn {
                    0% { opacity: 0; transform: translateX(-50%) scale(0.4) rotate(-6deg); }
                    60% { transform: translateX(-50%) scale(1.1) rotate(2deg); }
                    100% { opacity: 1; transform: translateX(-50%) scale(1) rotate(0deg); }
                }
            `}</style>
    </>
  );
}
