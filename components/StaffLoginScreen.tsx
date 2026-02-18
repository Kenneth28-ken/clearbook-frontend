
import React, { useState } from 'react';
import { Staff } from '../types';

interface StaffLoginScreenProps {
  staffList: Staff[];
  onStaffAuthenticated: (staff: Staff) => void;
  onLogoutManager: () => void;
}

const StaffLoginScreen: React.FC<StaffLoginScreenProps> = ({ staffList, onStaffAuthenticated, onLogoutManager }) => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Synthesized Startup Chime (Pleasant Harmonious Arpeggio)
  const playStartupSound = () => {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const playNote = (freq: number, start: number, duration: number, volume: number = 0.08) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Professional 3-second Arpeggio (C Major 9)
      playNote(261.63, now, 3.0, 0.08);       // C4
      playNote(329.63, now + 0.1, 2.9, 0.06);  // E4
      playNote(392.00, now + 0.2, 2.8, 0.06);  // G4
      playNote(493.88, now + 0.3, 2.7, 0.05);  // B4
      playNote(523.25, now + 0.4, 2.6, 0.05);  // C5
      playNote(587.33, now + 0.5, 2.5, 0.04);  // D5
    } catch (e) {
      console.warn("Audio Context blocked by browser or failed.");
    }
  };

  const handlePinClick = (val: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = () => {
    if (selectedStaff && pin === selectedStaff.pin) {
      playStartupSound();
      onStaffAuthenticated(selectedStaff);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  React.useEffect(() => {
    if (pin.length === 4 && selectedStaff) {
      handleLogin();
    }
  }, [pin, selectedStaff]);

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 relative z-10">
        
        <div className="w-full md:w-1/2">
           <div className="mb-10 text-center md:text-left">
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Terminal Access</h1>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Select profile to start shift</p>
           </div>

           <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar p-1">
              {staffList.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => { setSelectedStaff(staff); setPin(''); setError(false); }}
                  className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center text-center gap-4 ${
                    selectedStaff?.id === staff.id 
                      ? 'bg-white text-gray-900 border-blue-500 shadow-2xl scale-105' 
                      : 'bg-gray-800/50 border-transparent hover:bg-gray-800 text-gray-400'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg ${staff.avatarColor || 'bg-blue-500'}`}>
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-sm uppercase truncate w-full">{staff.name}</div>
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">{staff.role}</div>
                  </div>
                </button>
              ))}
           </div>
           
           <button 
             onClick={onLogoutManager}
             className="mt-12 text-gray-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto md:mx-0"
           >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout Manager Account
           </button>
        </div>

        <div className={`w-full max-w-[400px] md:w-1/2 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl transition-all ${!selectedStaff ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
           <div className="text-center mb-8">
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-4 block">Enter Security PIN</label>
              <div className="flex justify-center gap-4">
                 {[0, 1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        error ? 'bg-red-500 border-red-500 animate-shake' : 
                        pin.length > i ? 'bg-blue-500 border-blue-500 scale-125' : 'border-white/20'
                      }`}
                    ></div>
                 ))}
              </div>
              {error && <p className="text-red-500 font-black text-[10px] uppercase mt-4 animate-pulse">Invalid Access PIN</p>}
           </div>

           <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button
                  key={n}
                  onClick={() => handlePinClick(n.toString())}
                  className="h-16 bg-white/10 hover:bg-white/20 rounded-2xl text-2xl font-black transition-all active:scale-90"
                >
                  {n}
                </button>
              ))}
              <div className="p-1"></div>
              <button
                onClick={() => handlePinClick('0')}
                className="h-16 bg-white/10 hover:bg-white/20 rounded-2xl text-2xl font-black transition-all active:scale-90"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-16 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default StaffLoginScreen;
