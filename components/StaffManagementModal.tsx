
import React, { useState } from 'react';
import { Staff, Attendant } from '../types';

interface StaffManagementModalProps {
  staffList: Staff[];
  attendantsList: Attendant[];
  onClose: () => void;
  onUpdateStaff: (id: string, updates: Partial<Staff>) => void;
  onAddStaff: (staff: Omit<Staff, 'id'>) => void;
  onRemoveStaff: (id: string) => void;
  onUpdateAttendant: (id: string, updates: Partial<Attendant>) => void;
  onAddAttendant: (staff: Omit<Attendant, 'id'>) => void;
  onRemoveAttendant: (id: string) => void;
}

const StaffManagementModal: React.FC<StaffManagementModalProps> = ({ 
  staffList, 
  attendantsList,
  onClose, 
  onUpdateStaff, 
  onAddStaff, 
  onRemoveStaff,
  onUpdateAttendant,
  onAddAttendant,
  onRemoveAttendant
}) => {
  const [activeTab, setActiveTab] = useState<'TERMINAL' | 'SERVICE'>('TERMINAL');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<'Cashier' | 'Supervisor' | 'Manager'>('Cashier');
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  const togglePin = (id: string) => {
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = () => {
    if (!newName) return;
    
    if (activeTab === 'TERMINAL') {
      if (!newPin) return;
      onAddStaff({
        name: newName,
        pin: newPin,
        role: newRole,
        avatarColor: 'bg-blue-500'
      });
    } else {
      onAddAttendant({
        name: newName,
        role: 'Server'
      });
    }
    
    setNewName('');
    setNewPin('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] p-6">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-8 bg-blue-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Personnel Management</h2>
            <p className="text-blue-100 font-bold uppercase text-xs tracking-widest mt-1">Secure Registry & Staff Profiles</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-white border-b px-8 py-4 flex gap-4 shrink-0">
          <button 
            onClick={() => setActiveTab('TERMINAL')}
            className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === 'TERMINAL' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            Terminal Staff (PIN Required)
          </button>
          <button 
            onClick={() => setActiveTab('SERVICE')}
            className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === 'SERVICE' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            Service Staff (Waiters/Attendants)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
          <div className="flex justify-between items-center mb-8">
             <h3 className="font-black text-gray-400 uppercase tracking-widest text-xs">
               {activeTab === 'TERMINAL' ? 'Terminal Access Registry' : 'Service Floor Registry'}
             </h3>
             <button 
               onClick={() => setIsAdding(true)}
               className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
             >
               Add {activeTab === 'TERMINAL' ? 'Staff Member' : 'Attendant'}
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {activeTab === 'TERMINAL' ? (
               staffList.map(staff => (
                 <div key={staff.id} className="bg-white p-6 rounded-3xl border-2 border-gray-100 flex items-center gap-4 group shadow-sm">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg ${staff.avatarColor || 'bg-blue-500'}`}>
                      {staff.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                       <input 
                          type="text" 
                          className="font-black text-gray-900 bg-transparent border-b border-transparent focus:border-blue-300 outline-none w-full uppercase"
                          value={staff.name}
                          onChange={(e) => onUpdateStaff(staff.id, { name: e.target.value })}
                        />
                       <div className="flex items-center gap-2 mt-1">
                          <select 
                             className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-transparent outline-none"
                             value={staff.role}
                             onChange={(e) => onUpdateStaff(staff.id, { role: e.target.value as any })}
                          >
                             <option value="Cashier">Cashier</option>
                             <option value="Supervisor">Supervisor</option>
                             <option value="Manager">Manager</option>
                          </select>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                             <span className="text-[10px] font-bold text-gray-400 uppercase">PIN:</span>
                             <input 
                               type={showPins[staff.id] ? "text" : "password"}
                               maxLength={4}
                               className="w-12 text-[10px] font-black text-gray-900 bg-transparent text-center border-none outline-none"
                               value={staff.pin}
                               onChange={(e) => onUpdateStaff(staff.id, { pin: e.target.value })}
                             />
                             <button onClick={() => togglePin(staff.id)} className="text-gray-300 hover:text-blue-500">
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                               </svg>
                             </button>
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => { if(confirm("Remove this staff?")) onRemoveStaff(staff.id); }}
                      className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                    </button>
                 </div>
               ))
             ) : (
               attendantsList.map(server => (
                 <div key={server.id} className="bg-white p-6 rounded-3xl border-2 border-gray-100 flex items-center gap-4 group shadow-sm">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-black shadow-lg">
                      {server.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                       <input 
                          type="text" 
                          className="font-black text-gray-900 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none w-full uppercase"
                          value={server.name}
                          onChange={(e) => onUpdateAttendant(server.id, { name: e.target.value })}
                        />
                       <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Service Attendant</div>
                    </div>
                    <button 
                      onClick={() => { if(confirm("Remove this server?")) onRemoveAttendant(server.id); }}
                      className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                    </button>
                 </div>
               ))
             )}
          </div>
        </div>

        {isAdding && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[400] p-6 animate-in fade-in duration-200">
             <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl space-y-6">
                <div className="text-center">
                   <h3 className="text-xl font-black uppercase">Register {activeTab === 'TERMINAL' ? 'Terminal User' : 'Service Attendant'}</h3>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Display Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold uppercase text-gray-900 outline-none focus:border-blue-600"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                   </div>
                   {activeTab === 'TERMINAL' && (
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Access PIN</label>
                           <input 
                             type="password" 
                             maxLength={4}
                             placeholder="••••"
                             className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-center text-gray-900 outline-none focus:border-blue-600"
                             value={newPin}
                             onChange={(e) => setNewPin(e.target.value)}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">System Role</label>
                           <select 
                             className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold appearance-none text-gray-900 outline-none focus:border-blue-600"
                             value={newRole}
                             onChange={(e) => setNewRole(e.target.value as any)}
                           >
                              <option value="Cashier">Cashier</option>
                              <option value="Supervisor">Supervisor</option>
                              <option value="Manager">Manager</option>
                           </select>
                        </div>
                     </div>
                   )}
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl uppercase text-xs">CANCEL</button>
                   <button onClick={handleAdd} className="flex-2 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg uppercase text-xs">CREATE PROFILE</button>
                </div>
             </div>
          </div>
        )}

        <div className="p-8 bg-white border-t flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-16 py-5 bg-gray-900 text-white font-black text-xl rounded-2xl hover:bg-black shadow-2xl transition-all active:scale-95 uppercase tracking-tight"
          >
            CLOSE REGISTRY
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffManagementModal;
