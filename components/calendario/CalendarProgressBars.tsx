
import React, { useState, useEffect, useCallback } from 'react';

interface ProgressBarCalProps {
  label: string;
  progress: number;
  idSuffix: string;
}

const ProgressBarCal: React.FC<ProgressBarCalProps> = ({ label, progress, idSuffix }) => {
    const getGradientAndGlow = useCallback(() => {
        let gradient, glowRgb;
        const baseColor = `accent-${idSuffix}`; // e.g. accent-year

        if (idSuffix === 'year') {
            gradient = `linear-gradient(90deg, #2f9e4f, #50fa7b)`; // green-dark, accent-green-medium
            glowRgb = `80, 250, 123`; // glow-color-green-rgb
        } else {
            if (progress < 25) {
                gradient = `linear-gradient(90deg, #c92a2a, #ff5555)`; // red-dark, accent-red-clear
                glowRgb = `255, 85, 85`; // accent-red-clear-rgb
            } else if (progress < 50) {
                gradient = `linear-gradient(90deg, #e8590c, #ffb86c)`; // orange-dark, accent-orange
                glowRgb = `255, 184, 108`; // accent-orange-rgb
            } else if (progress < 75) {
                gradient = `linear-gradient(90deg, #c3e08d, #f1fa8c)`; // accent-yellow-green, accent-yellow-pale
                glowRgb = `195, 224, 141`; // accent-yellow-green-rgb
            } else {
                gradient = `linear-gradient(90deg, #2f9e4f, #50fa7b)`; // green-dark, accent-green-medium
                glowRgb = `80, 250, 123`; // glow-color-green-rgb
            }
        }
        return { gradient, glowRgb };
    }, [idSuffix, progress]);
    
    const { gradient, glowRgb } = getGradientAndGlow();

  return (
    <div className="flex items-center mb-2.5 text-sm text-text-secondary">
      <span className="min-w-[40px] mr-2.5">{label}:</span>
      <div className="flex-grow max-w-xs sm:max-w-full md:max-w-[200px] h-4.5 bg-bg-card rounded-full overflow-hidden shadow-inner mr-2.5">
        <div
          id={`progress-bar-${idSuffix}`}
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{ 
            width: `${progress}%`,
            background: gradient,
            boxShadow: `0 0 10px 2px rgba(${glowRgb}, 0.5)`
           }}
        >
          <div 
            className="absolute top-0 left-0 h-full w-full rounded-full animate-shimmer"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.05) 60%, transparent 100%)',
              backgroundSize: '800px 100%',
            }}
          />
        </div>
      </div>
      <span id={`progress-text-${idSuffix}`} className="font-medium text-text-primary min-w-[45px] text-right">
        {Math.floor(progress)}%
      </span>
      <style>{`
        @keyframes shimmer {
            0% { background-position: -800px 0; }
            100% { background-position: 800px 0; }
        }
        .animate-shimmer {
            animation: shimmer 3.5s infinite linear;
        }
      `}</style>
    </div>
  );
};


const CalendarProgressBars: React.FC = () => {
  const [progressValues, setProgressValues] = useState({ year: 0, month: 0, day: 0 });

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const daysInYear = (now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0 ? 366 : 365;
      const yearProgress = (dayOfYear / daysInYear) * 100;

      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const dayOfMonth = now.getDate();
      const daysInMonth = endOfMonth.getDate();
      const monthProgress = (dayOfMonth / daysInMonth) * 100;

      const dayProgress = ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100;
      
      setProgressValues({ year: yearProgress, month: monthProgress, day: dayProgress });
    };

    updateProgress();
    const intervalId = setInterval(updateProgress, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div id="calendar-progress-bars" className="mb-5 text-left px-2.5">
      <ProgressBarCal label="Mes" progress={progressValues.month} idSuffix="month" />
      <ProgressBarCal label="Día" progress={progressValues.day} idSuffix="day" />
      <ProgressBarCal label="Año" progress={progressValues.year} idSuffix="year" />
    </div>
  );
};

export default CalendarProgressBars;
