
import React from 'react';
import { Attendant } from '../types';

interface ServerModalProps {
  attendants: Attendant[];
  onSelect: (server: Attendant) => void;
  onClose: () => void;
}

const ServerModal: React.FC<ServerModalProps> = ({ attendants, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] p-6">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[70vh]">
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black uppercase tracking-tight">Assign Attendant / Server</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-4 bg-gray-50">
          {attendants.map((server) => (
            <button
              key={server.id}
              onClick={() => {
                onSelect(server);
                onClose();
              }}
              className="p-6 bg-white border-2 border-transparent rounded-2xl shadow-sm hover:border-blue-600 hover:shadow-lg transition-all active:scale-95 flex items-center gap-4 text-left group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {server.name.charAt(0)}
              </div>
              <div>
                <div className="text-lg font-black text-gray-800 uppercase">{server.name}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{server.role}</div>
                <div className="text-[10px] text-blue-500 font-mono mt-1">ID: {server.id}</div>
              </div>
            </button>
          ))}
          {attendants.length === 0 && (
            <div className="col-span-2 py-10 text-center text-gray-400 uppercase font-black text-sm">
               No staff registered in registry.
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t flex justify-between items-center shrink-0">
           <p className="text-xs text-gray-400 font-bold max-w-[300px]">
             Attendant assignment is tracked for commissions and service reports.
           </p>
           <button 
             onClick={onClose}
             className="px-10 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
           >
             CLOSE
           </button>
        </div>
      </div>
    </div>
  );
};

export default ServerModal;
