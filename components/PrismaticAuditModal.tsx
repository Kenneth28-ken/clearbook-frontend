
import React from 'react';
import { AuditCheckpoint, AuditType } from '../types';

interface PrismaticAuditModalProps {
  checkpoints: AuditCheckpoint[];
  onClose: () => void;
}

const PrismaticAuditModal: React.FC<PrismaticAuditModalProps> = ({ checkpoints, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'WARNING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'CRITICAL': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const getTypeIcon = (type: AuditType) => {
    switch (type) {
      case AuditType.SYSTEM:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case AuditType.SECURITY:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case AuditType.INVENTORY:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case AuditType.SYNC:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case AuditType.TRANSACTION:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[200] p-6">
      <div className="bg-zinc-950 rounded-[3rem] w-full max-w-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-10 border-b border-zinc-900 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Prismatic Audit</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Key System Checkpoints & Integrity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-all text-zinc-400 hover:text-white border border-zinc-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
          {checkpoints.map((cp) => (
            <div key={cp.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] flex items-center gap-6 group hover:bg-zinc-900 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getStatusColor(cp.status)}`}>
                {getTypeIcon(cp.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{cp.type}</span>
                  <span className="text-[9px] font-bold text-zinc-600 tabular-nums">
                    {cp.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">{cp.message}</h3>
              </div>
              <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(cp.status)}`}>
                {cp.status}
              </div>
            </div>
          ))}
        </div>

        <div className="p-10 border-t border-zinc-900 bg-zinc-950/50 flex justify-center">
          <button 
            onClick={onClose}
            className="px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl uppercase tracking-widest text-xs active:scale-95"
          >
            Acknowledge Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrismaticAuditModal;
