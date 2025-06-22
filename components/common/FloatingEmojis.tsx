
import React from 'react';
import { FLOATING_EMOJIS_LIST } from '../../constants';

const emojiColors = [
  'text-accent-yellow-pale', 'text-accent-green-medium', 'text-accent-blue-info', 
  'text-accent-red-clear', 'text-accent-green-neon', 'text-accent-yellow-green',
  'text-accent-pink', 'text-accent-purple', 'text-accent-orange', 'text-accent-gold'
];

const FloatingEmojis: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {FLOATING_EMOJIS_LIST.map((emoji, index) => (
        <span
          key={index}
          className={`floating-emoji absolute pointer-events-none select-none opacity-0 ${emojiColors[index % emojiColors.length]}`}
          style={{
            left: `${(index * 10 + 5 + Math.random() * 5)}%`, // Spread them out
            animationName: 'floatUp',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 15}s`, // Random duration between 15-30s
            fontSize: `${3 + Math.random() * 3}rem`, // Random size between 3-6rem
            textShadow: '0 0 8px rgba(0,0,0,0.3)',
          }}
        >
          {emoji}
        </span>
      ))}
      <style>{`
        @keyframes floatUp {
            from { transform: translateY(105vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.5; }
            90% { opacity: 0.5; }
            to { transform: translateY(-15vh) rotate(${Math.random() * 360}deg); opacity: 0; }
        }
        @media (max-width:480px){ 
            .floating-emoji { font-size: 2.5rem !important; opacity: 0.2 !important; }
        }
      `}</style>
    </div>
  );
};

export default FloatingEmojis;
