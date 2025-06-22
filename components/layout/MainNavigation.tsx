
import React from 'react';
import { PageId } from '../../types';

interface NavButtonProps {
  pageId: PageId;
  label: string;
  icon: string;
  activePage: PageId;
  onNavigate: (pageId: PageId) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ pageId, label, icon, activePage, onNavigate }) => {
  const isActive = activePage === pageId;
  return (
    <button
      onClick={() => onNavigate(pageId)}
      className={`
        bg-bg-card-light text-text-primary border border-text-primary/10 
        py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out shadow-md
        hover:bg-accent-blue-info hover:text-bg-dark hover:-translate-y-0.5 hover:shadow-glow-blue
        focus:outline-none focus:ring-2 focus:ring-accent-blue-info focus:ring-opacity-50
        ${isActive ? 'bg-accent-green-neon text-bg-dark shadow-glow-green-neon font-bold' : ''}
        sm:px-4 sm:py-2 sm:text-xs md:px-4 md:py-2.5 md:text-sm
      `}
    >
      {icon} {label}
    </button>
  );
};


interface MainNavigationProps {
  activePage: PageId;
  onNavigate: (pageId: PageId) => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ activePage, onNavigate }) => {
  const navItems: { pageId: PageId; label: string; icon: string }[] = [
    { pageId: 'calendario-page', label: 'Calendario', icon: '📅' },
    { pageId: 'ingresos-page', label: 'Ingresos', icon: '💰' },
    { pageId: 'universidad-page', label: 'Universidad', icon: '🎓' },
    { pageId: 'productividad-page', label: 'Productividad', icon: '🚀' },
  ];

  return (
    <nav 
        className="
        sticky top-4 z-[1000] flex justify-center flex-wrap gap-2.5 
        p-4 bg-bg-card border border-white/20 rounded-2xl shadow-xl mb-6 
        w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto
        sm:p-2 sm:gap-2
        "
        style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} // For browsers supporting it
    >
      {navItems.map(item => (
        <NavButton
          key={item.pageId}
          pageId={item.pageId}
          label={item.label}
          icon={item.icon}
          activePage={activePage}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
};

export default MainNavigation;
