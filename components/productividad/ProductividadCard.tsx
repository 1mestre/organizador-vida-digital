
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const ProductividadCard: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div
    className={`bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl shadow-lg p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default ProductividadCard;
