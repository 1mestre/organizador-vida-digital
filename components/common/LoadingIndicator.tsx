
import React from 'react';

interface LoadingIndicatorProps {
  isVisible: boolean;
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isVisible, message = "Cargando datos compartidos..." }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-bg-dark/90 flex justify-center items-center z-[9999] text-accent-blue-info text-lg transition-opacity duration-500 ease-in-out"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {message}
    </div>
  );
};

export default LoadingIndicator;
