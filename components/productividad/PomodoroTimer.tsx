
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Hourglass, Settings, AlertTriangle } from 'lucide-react';
import ProductividadCard from './ProductividadCard';
import { PRODUCTIVITY_CONTENT, AMBIANCE_AUDIO_URLS } from '../../constants';

const PomodoroTimer: React.FC = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);

  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycle, setCycle] = useState(1); // Current cycle (1-4)
  const [completedPomodorosInSession, setCompletedPomodorosInSession] = useState(0); // Pomodoros in current 4-cycle session
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const totalSecondsRemaining = minutes * 60 + seconds;
  const initialTimeForCurrentSegment = (isWorkSession ? workMinutes : ((cycle % 4 === 0 && !isWorkSession) ? longBreakMinutes : shortBreakMinutes)) * 60;
  const progress = initialTimeForCurrentSegment > 0 ? ((initialTimeForCurrentSegment - totalSecondsRemaining) / initialTimeForCurrentSegment) * 100 : 0;
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && totalSecondsRemaining > 0) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes > 0) {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    } else if (totalSecondsRemaining === 0 && isActive) {
      new Audio(AMBIANCE_AUDIO_URLS.alarm).play().catch(e => console.error("Error playing sound:", e));

      if (isWorkSession) {
        setCompletedPomodorosInSession(c => c + 1);
        setIsWorkSession(false); // Switch to break
        // Determine break length
        if ((cycle) % 4 === 0) { // About to start long break (after 4th work session)
            setMinutes(longBreakMinutes);
        } else {
            setMinutes(shortBreakMinutes);
        }

      } else { // Break finished
        setIsWorkSession(true); // Switch to work
        setMinutes(workMinutes);
        // Advance cycle after a break is completed
        if (cycle === 4) {
          setCycle(1); // Reset cycle
          setCompletedPomodorosInSession(0); // Reset pomodoros for new session
        } else {
          setCycle(c => c + 1);
        }
      }
      setSeconds(0);
      setIsActive(false); // Pause timer automatically
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds, minutes, cycle, isWorkSession, totalSecondsRemaining, workMinutes, shortBreakMinutes, longBreakMinutes, completedPomodorosInSession]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetCurrentSegmentTimer = () => {
    setIsActive(false);
    setMinutes(isWorkSession ? workMinutes : ( (cycle % 4 === 0 && !isWorkSession) ? longBreakMinutes : shortBreakMinutes));
    setSeconds(0);
  };

  const handleTimeChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const numValue = parseInt(value, 10);
    if (numValue > 0 && numValue <= 120) {
      setter(numValue);
      // If timer is not active, update the current segment's minutes
      if (!isActive) {
        if (setter === setWorkMinutes && isWorkSession) setMinutes(numValue);
        else if (setter === setShortBreakMinutes && !isWorkSession && cycle % 4 !== 0) setMinutes(numValue);
        else if (setter === setLongBreakMinutes && !isWorkSession && cycle % 4 === 0) setMinutes(numValue);
        setSeconds(0); // Reset seconds when time setting changes
      }
    }
  };
  
  return (
    <ProductividadCard>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-cyan-300 flex items-center gap-2">
          <Hourglass size={20} /> Temporizador Pomodoro
        </h2>
        <button onClick={() => setShowSettings(!showSettings)} className="text-cyan-400 hover:text-cyan-200">
          <Settings size={20}/>
        </button>
      </div>

      {showSettings && (
        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-900/50 p-3 rounded-lg">
          <label className="text-sm">Trabajo <input type="number" value={workMinutes} onChange={e => handleTimeChange(setWorkMinutes, e.target.value)} className="bg-slate-700 w-full rounded p-1 text-center"/></label>
          <label className="text-sm">Descanso <input type="number" value={shortBreakMinutes} onChange={e => handleTimeChange(setShortBreakMinutes, e.target.value)} className="bg-slate-700 w-full rounded p-1 text-center"/></label>
          <label className="text-sm">Largo <input type="number" value={longBreakMinutes} onChange={e => handleTimeChange(setLongBreakMinutes, e.target.value)} className="bg-slate-700 w-full rounded p-1 text-center"/></label>
        </div>
      )}

      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
          <circle className="text-slate-700" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent" />
          <circle
            className="text-cyan-400"
            strokeWidth="7"
            strokeLinecap="round"
            cx="50" cy="50" r="45" fill="transparent"
            strokeDasharray="283"
            strokeDashoffset={283 - (progress / 100) * 283}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s linear' }}
          />
        </svg>
        <div className="text-5xl font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={toggleTimer} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 transition-all text-white font-bold py-2 px-4 rounded-lg shadow-md shadow-cyan-500/20">
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          {isActive ? 'Pausar' : (totalSecondsRemaining === initialTimeForCurrentSegment ? 'Iniciar' : 'Continuar')}
        </button>
        <button onClick={resetCurrentSegmentTimer} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 transition-all text-white font-bold py-2 px-4 rounded-lg">
          <RotateCcw size={18} /> Reset
        </button>
      </div>
      <div className="text-center mt-4 text-cyan-200">
        <p>Ciclo {cycle} de 4</p>
        <p className="font-semibold text-lg">{isWorkSession ? ' concentración' : ( (cycle % 4 === 0 && !isWorkSession) ? 'Descanso Largo' : 'Descanso Corto')}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-cyan-500/10">
        <div className="flex justify-center gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`w-8 h-8 rounded-md transition-colors ${i < completedPomodorosInSession ? 'bg-green-500' : 'bg-slate-600'}`}></div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">Pomodoros completados en esta sesión</p>
      </div>

      <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-orange-300 font-medium text-sm">TÁCTICA ANTI-PROCRASTINACIÓN</span>
        </div>
        <p className="text-xs text-orange-100">
          {PRODUCTIVITY_CONTENT.antiProcrastinationTactic}
        </p>
      </div>
    </ProductividadCard>
  );
};

export default PomodoroTimer;
