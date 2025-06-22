
import React from 'react';

interface WidgetCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ children, className = '', id, style }) => {
  return (
    <div
      id={id}
      className={`bg-bg-card border border-white/20 rounded-2xl shadow-lg p-6 mb-6 text-center flex flex-col will-change-transform isolate transform-gpu contain-layout-style-paint ${className}`}
      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', ...style }}
    >
      {children}
    </div>
  );
};

export default WidgetCard;
