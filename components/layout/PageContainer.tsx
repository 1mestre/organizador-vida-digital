
import React from 'react';

interface PageContainerProps {
  id: string;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ id, isActive, children, className = '' }) => {
  return (
    <div
      id={id}
      className={`
        w-full px-2.5 transform-gpu
        ${isActive ? 'block animate-fadeInPage' : 'hidden'}
        ${className}
      `}
    >
      <style>{`
        @keyframes fadeInPage { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeInPage { animation: fadeInPage 0.5s ease-out forwards; }
      `}</style>
      <div className="flex flex-wrap gap-5 justify-center w-full">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
