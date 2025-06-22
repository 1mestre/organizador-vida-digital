
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Power, PowerOff } from 'lucide-react';
import ProductividadCard from './ProductividadCard';
import { AMBIANCE_SOUNDS, AMBIANCE_AUDIO_URLS } from '../../constants';

const AmbiancePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState<keyof typeof AMBIANCE_SOUNDS>('binaural');
  const [baseFrequency, setBaseFrequency] = useState(432);
  const [beatFrequency, setBeatFrequency] = useState(10); // For binaural
  const [volume, setVolume] = useState(0.1); // Lower default volume

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<any>(null); // Can be Oscillator or BufferSource
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopCurrentSound = useCallback(() => {
    if (sourceNodeRef.current) {
      if (soundType === 'binaural' && sourceNodeRef.current.left && sourceNodeRef.current.right) {
        sourceNodeRef.current.left.stop();
        sourceNodeRef.current.right.stop();
      } else if (sourceNodeRef.current.stop) { // For BufferSource or single Oscillator
        sourceNodeRef.current.stop();
      }
      sourceNodeRef.current = null;
    }
  }, [soundType]);

  const playSound = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    stopCurrentSound();

    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContext.createGain();
      gainNodeRef.current.connect(audioContext.destination);
    }
    gainNodeRef.current.gain.setValueAtTime(volume, audioContext.currentTime);

    switch (soundType) {
      case 'binaural': {
        const leftFreq = baseFrequency - beatFrequency / 2;
        const rightFreq = baseFrequency + beatFrequency / 2;

        const leftOscillator = audioContext.createOscillator();
        leftOscillator.type = 'sine';
        leftOscillator.frequency.setValueAtTime(leftFreq, audioContext.currentTime);
        const leftPanner = audioContext.createStereoPanner();
        leftPanner.pan.setValueAtTime(-1, audioContext.currentTime);
        leftOscillator.connect(leftPanner).connect(gainNodeRef.current);
        leftOscillator.start();

        const rightOscillator = audioContext.createOscillator();
        rightOscillator.type = 'sine';
        rightOscillator.frequency.setValueAtTime(rightFreq, audioContext.currentTime);
        const rightPanner = audioContext.createStereoPanner();
        rightPanner.pan.setValueAtTime(1, audioContext.currentTime);
        rightOscillator.connect(rightPanner).connect(gainNodeRef.current);
        rightOscillator.start();
        
        sourceNodeRef.current = { left: leftOscillator, right: rightOscillator };
        break;
      }
      case 'white':
      case 'brown': {
        const bufferSize = audioContext.sampleRate * 2; // 2 seconds buffer
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        if (soundType === 'white') {
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        } else { // brown
          let lastOut = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Amplify
          }
        }
        const node = audioContext.createBufferSource();
        node.buffer = buffer;
        node.loop = true;
        node.connect(gainNodeRef.current);
        node.start();
        sourceNodeRef.current = node;
        break;
      }
      case 'rain':
      case 'ocean': {
        try {
            const soundUrl = AMBIANCE_AUDIO_URLS[soundType];
            const response = await fetch(soundUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const node = audioContext.createBufferSource();
            node.buffer = audioBuffer;
            node.loop = true;
            node.connect(gainNodeRef.current);
            node.start();
            sourceNodeRef.current = node;
        } catch (error) {
            console.error(`Error loading ${soundType} sound:`, error);
            setIsPlaying(false); // Stop if sound fails to load
        }
        break;
      }
      default:
        break;
    }
    if(sourceNodeRef.current) setIsPlaying(true); // only set if sound started

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundType, baseFrequency, beatFrequency, volume, stopCurrentSound]);

  const toggleSound = () => {
    if (isPlaying) {
      stopCurrentSound();
      setIsPlaying(false);
    } else {
      playSound();
    }
  };

  useEffect(() => { // Re-trigger playSound if parameters change while playing
    if (isPlaying) {
      playSound();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundType, baseFrequency, beatFrequency]); // volume is handled separately

  useEffect(() => { // Update volume dynamically
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.01);
    }
  }, [volume]);

  useEffect(() => { // Cleanup
    return () => {
      if (audioContextRef.current) {
        stopCurrentSound();
        audioContextRef.current.close().catch(console.error);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProductividadCard>
      <h2 className="text-xl font-semibold text-cyan-300 flex items-center gap-2 mb-4">
        <Music size={20} /> Sonidos Ambientales
      </h2>

      <div className="mb-4">
        <label htmlFor="sound-type" className="block text-sm font-medium text-slate-300 mb-1">Tipo de Sonido</label>
        <select 
            id="sound-type" 
            value={soundType} 
            onChange={e => setSoundType(e.target.value as keyof typeof AMBIANCE_SOUNDS)} 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
        >
          {Object.entries(AMBIANCE_SOUNDS).map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {soundType === 'binaural' && (
          <>
            <div>
              <label htmlFor="base-freq" className="block text-sm font-medium text-slate-300">Frecuencia Base</label>
              <div className="flex items-center gap-2">
                <input id="base-freq" type="range" min="100" max="1000" value={baseFrequency} onChange={(e) => setBaseFrequency(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan"/>
                <span className="font-mono text-cyan-400 w-16 text-center">{baseFrequency} Hz</span>
              </div>
            </div>
            <div>
              <label htmlFor="beat-freq" className="block text-sm font-medium text-slate-300">Frecuencia del Beat</label>
              <div className="flex items-center gap-2">
                <input id="beat-freq" type="range" min="1" max="30" value={beatFrequency} onChange={(e) => setBeatFrequency(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan"/>
                <span className="font-mono text-cyan-400 w-16 text-center">{beatFrequency} Hz</span>
              </div>
            </div>
          </>
        )}
        <div>
          <label htmlFor="volume" className="block text-sm font-medium text-slate-300">Volumen</label>
          <div className="flex items-center gap-2">
            <input id="volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan"/>
            <span className="font-mono text-cyan-400 w-16 text-center">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <button onClick={toggleSound} className={`flex items-center gap-2 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg ${isPlaying ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20'}`}>
          {isPlaying ? <PowerOff size={18} /> : <Power size={18} />}
          {isPlaying ? 'Detener' : 'Reproducir'}
        </button>
      </div>
    </ProductividadCard>
  );
};

export default AmbiancePlayer;
