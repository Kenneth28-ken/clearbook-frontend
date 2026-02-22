
import React, { useState, useEffect } from 'react';
import { db, firebase } from '../firebase';

interface UserRecord {
  id: string;
  email: string;
  lastLogin: Date;
  status: 'ACTIVE' | 'RESTRICTED' | 'SHUTDOWN';
  businessName?: string;
}

interface MasterDashboardModalProps {
  onClose: () => void;
  onImpersonate: (uid: string) => void;
  currentImpersonatedUid: string | null;
  masterUid: string;
}

const MasterDashboardModal: React.FC<MasterDashboardModalProps> = ({ onClose, onImpersonate, currentImpersonatedUid, masterUid }) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      // Fetch from primary registry
      const primarySnap = await db.collection("pos_accounts").get();
      const uList = primarySnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || 'No Email',
          lastLogin: data.lastLogin ? (data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin)) : new Date(),
          status: data.status || 'ACTIVE',
          businessName: data.businessName || 'Unnamed Business'
        } as UserRecord;
      });

      // Fetch from legacy registry
      let legacyList: UserRecord[] = [];
      try {
        const legacySnap = await db.collection("users").get();
        legacyList = legacySnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email || 'No Email Registered',
            lastLogin: data.lastLogin ? (data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin)) : new Date(),
            status: data.status || 'ACTIVE',
            businessName: data.businessName || 'Legacy Account'
          } as UserRecord;
        });
      } catch (e) {
        console.warn("Legacy fetch failed:", e);
      }

      // Merge and filter
      const merged = [...uList];
      legacyList.forEach(lu => {
        if (!merged.find(mu => mu.id === lu.id)) {
          merged.push(lu);
        }
      });

      setUsers(merged.filter(u => u.id !== masterUid));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Also set up a real-time listener for the primary registry
    const unsub = db.collection("pos_accounts").onSnapshot(() => {
      fetchUsers();
    });
    return () => unsub();
  }, [masterUid]);

  const handleStatusChange = async (uid: string, newStatus: 'ACTIVE' | 'RESTRICTED' | 'SHUTDOWN') => {
    try {
      await db.collection("pos_accounts").doc(uid).update({ status: newStatus });
    } catch (e) {
      console.error("Failed to update user status", e);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[500] p-4 sm:p-10">
      <div className="bg-white rounded-[3rem] w-full max-w-6xl h-full flex flex-col overflow-hidden shadow-2xl border-8 border-amber-400/20">
        
        {/* Header */}
        <div className="p-8 bg-amber-500 text-amber-950 flex justify-between items-center shrink-0 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-amber-600 rounded-[2rem] shadow-2xl text-white">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Master Overload Control</h2>
              <p className="text-amber-900 font-bold uppercase text-xs tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                System Administrator Dashboard • {users.length} REGISTERED CUSTOMERS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchUsers} 
              disabled={isRefreshing}
              className={`p-3 bg-amber-600 hover:bg-amber-700 rounded-full transition-all text-white ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={onClose} className="p-3 bg-amber-600 hover:bg-amber-700 rounded-full transition-all text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="relative max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="Search customers by email or business name..."
              className="w-full pl-14 pr-4 py-5 bg-white border-2 border-gray-200 rounded-2xl font-black outline-none focus:border-amber-500 transition-all uppercase text-gray-900 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(u => (
                <div key={u.id} className={`bg-white p-6 rounded-[2.5rem] border-4 transition-all shadow-sm flex flex-col gap-4 ${currentImpersonatedUid === u.id ? 'border-amber-500 ring-4 ring-amber-100' : 'border-gray-100 hover:border-amber-200'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">UID: {u.id.substring(0, 8)}...</div>
                      <h3 className="font-black text-gray-900 text-xl leading-tight uppercase truncate">{u.businessName}</h3>
                      <p className="text-xs font-bold text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                      u.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 
                      u.status === 'RESTRICTED' ? 'bg-orange-100 text-orange-600' : 
                      'bg-red-100 text-red-600'
                    }`}>
                      {u.status}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <span>Last Activity</span>
                      <span className="text-gray-900">{u.lastLogin.toLocaleDateString()} {u.lastLogin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button 
                      onClick={() => onImpersonate(u.id)}
                      className={`col-span-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        currentImpersonatedUid === u.id ? 'bg-amber-100 text-amber-600 cursor-default' : 'bg-gray-900 text-white hover:bg-black shadow-lg'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {currentImpersonatedUid === u.id ? 'CURRENTLY LOGGED IN' : 'LOG INTO ACCOUNT'}
                    </button>

                    <button 
                      onClick={() => handleStatusChange(u.id, u.status === 'RESTRICTED' ? 'ACTIVE' : 'RESTRICTED')}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                        u.status === 'RESTRICTED' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-100 hover:border-orange-200'
                      }`}
                    >
                      {u.status === 'RESTRICTED' ? 'UNRESTRICT' : 'RESTRICT'}
                    </button>

                    <button 
                      onClick={() => handleStatusChange(u.id, u.status === 'SHUTDOWN' ? 'ACTIVE' : 'SHUTDOWN')}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                        u.status === 'SHUTDOWN' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-100 hover:border-red-200'
                      }`}
                    >
                      {u.status === 'SHUTDOWN' ? 'RE-ENABLE' : 'SHUTDOWN'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t flex justify-between items-center shrink-0">
           <div className="flex items-center gap-4 text-gray-400">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-tight max-w-xl">Master Overload allows you to impersonate any customer to resolve issues. Restricted accounts have limited access, while Shutdown accounts are completely locked. Use with caution.</p>
           </div>
           <button 
             onClick={onClose}
             className="px-16 py-5 bg-amber-500 text-amber-950 font-black text-xl rounded-2xl hover:bg-amber-400 shadow-2xl transition-all active:scale-95 uppercase tracking-tight"
           >
             EXIT MASTER CONTROL
           </button>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboardModal;
