
import React, { useState, useEffect } from 'react';
import { db, firebase } from '../firebase';

interface UserRecord {
  id: string;
  email: string;
  lastLogin: Date;
  status: 'ACTIVE' | 'RESTRICTED' | 'SHUTDOWN';
  businessName?: string;
  menuEnabled?: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // Fetch from primary registry
      console.log("MasterDashboard: Fetching from pos_accounts...");
      let uList: UserRecord[] = [];
      try {
        const primarySnap = await db.collection("pos_accounts").get();
        console.log(`MasterDashboard: Found ${primarySnap.size} accounts in pos_accounts`);
        uList = primarySnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email || 'No Email',
            lastLogin: data.lastLogin ? (data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin)) : new Date(),
            status: data.status || 'ACTIVE',
            businessName: data.businessName || 'Unnamed Business',
            menuEnabled: data.menuEnabled !== false
          } as UserRecord;
        });
      } catch (e: any) {
        console.error("MasterDashboard: pos_accounts fetch failed:", e);
        if (e.code === 'permission-denied') {
          setError("PERMISSION DENIED: Master account does not have access to list pos_accounts. Please check Firestore security rules.");
        }
      }

      // Fetch from legacy registry
      console.log("MasterDashboard: Fetching from users...");
      let legacyList: UserRecord[] = [];
      try {
        const legacySnap = await db.collection("users").get();
        console.log(`MasterDashboard: Found ${legacySnap.size} accounts in users`);
        legacyList = legacySnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email || 'No Email Registered',
            lastLogin: data.lastLogin ? (data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin)) : new Date(),
            status: data.status || 'ACTIVE',
            businessName: data.businessName || 'Legacy Account',
            menuEnabled: data.menuEnabled !== false
          } as UserRecord;
        });
      } catch (e: any) {
        console.warn("MasterDashboard: users fetch failed:", e);
      }

      // Merge and filter
      const merged = [...uList];
      legacyList.forEach(lu => {
        if (!merged.find(mu => mu.id === lu.id)) {
          merged.push(lu);
        }
      });

      const finalUsers = merged.filter(u => u.id !== masterUid);
      setUsers(finalUsers);
      
      if (finalUsers.length === 0 && !error) {
        console.warn("No users found in pos_accounts or users collections (matching Master criteria)");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch users. System error.");
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
    }, (err) => {
      console.error("Snapshot error:", err);
      setError("Real-time sync failed: " + err.message);
    });
    return () => unsub();
  }, [masterUid]);

  const handleStatusChange = async (uid: string, newStatus: 'ACTIVE' | 'RESTRICTED' | 'SHUTDOWN') => {
    try {
      await db.collection("pos_accounts").doc(uid).set({ status: newStatus }, { merge: true });
      fetchUsers();
    } catch (e) {
      console.error("Failed to update user status", e);
      alert("Status update failed. You may not have permission to write to pos_accounts.");
    }
  };

  const handleMenuToggle = async (uid: string, currentState: boolean) => {
    try {
      await db.collection("pos_accounts").doc(uid).set({ menuEnabled: !currentState }, { merge: true });
      fetchUsers();
    } catch (e) {
      console.error("Failed to toggle menu status", e);
      alert("Menu status update failed.");
    }
  };

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserBusiness, setNewUserBusiness] = useState('');
  const [newUserPin, setNewUserPin] = useState('');

  const [isSettingPin, setIsSettingPin] = useState<string | null>(null);
  const [newManagerPin, setNewManagerPin] = useState('');

  const [isEditingBusiness, setIsEditingBusiness] = useState<string | null>(null);
  const [newBusinessName, setNewBusinessName] = useState('');

  const handleCreateUser = async () => {
    if (!newUserId || !newUserEmail) return;
    try {
      await db.collection("pos_accounts").doc(newUserId).set({
        email: newUserEmail,
        businessName: newUserBusiness || 'New Business',
        status: 'ACTIVE',
        lastLogin: firebase.firestore.Timestamp.now()
      }, { merge: true });

      if (newUserPin) {
        await db.collection("users").doc(newUserId).collection("config").doc("terminal").set({
          managerOverridePin: newUserPin
        }, { merge: true });
      }

      setIsAddingUser(false);
      setNewUserId('');
      setNewUserEmail('');
      setNewUserBusiness('');
      setNewUserPin('');
      fetchUsers();
    } catch (e: any) {
      alert("Failed to create user: " + e.message);
    }
  };

  const handleUpdateBusinessName = async (uid: string) => {
    if (!newBusinessName) return;
    try {
      await db.collection("pos_accounts").doc(uid).set({
        businessName: newBusinessName
      }, { merge: true });
      setIsEditingBusiness(null);
      setNewBusinessName('');
      fetchUsers();
    } catch (e: any) {
      alert("Failed to update business name: " + e.message);
    }
  };

  const handleUpdatePin = async (uid: string) => {
    if (!newManagerPin) return;
    try {
      await db.collection("users").doc(uid).collection("config").doc("terminal").set({
        managerOverridePin: newManagerPin
      }, { merge: true });
      setIsSettingPin(null);
      setNewManagerPin('');
      alert("Manager PIN updated for " + uid);
    } catch (e: any) {
      alert("Failed to update PIN: " + e.message);
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
              <p className="text-amber-900 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                ADMIN: {masterUid} • {users.length} REGISTERED CUSTOMERS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAddingUser(true)}
              className="px-6 py-4 bg-amber-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
              Manual Registry
            </button>
            <button 
              onClick={fetchUsers} 
              disabled={isRefreshing}
              className={`p-4 bg-amber-600 hover:bg-amber-700 rounded-2xl transition-all text-white ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={onClose} className="p-4 bg-amber-600 hover:bg-amber-700 rounded-2xl transition-all text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar / Direct Entry */}
        <div className="p-6 bg-gray-50 border-b flex gap-4">
          <div className="relative flex-1">
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
          <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Direct Impersonation (UID)..."
               className="w-64 px-6 bg-amber-50 border-2 border-amber-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all text-gray-900 shadow-sm text-xs"
               onKeyDown={(e) => {
                 if (e.key === 'Enter') onImpersonate((e.target as HTMLInputElement).value);
               }}
             />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border-4 border-red-50 text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase mb-2">Registry Access Failed</h3>
              <p className="text-gray-500 font-bold max-w-md">{error}</p>
              <button 
                onClick={fetchUsers}
                className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border-4 border-gray-50 text-center">
              <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase mb-2">No Registered Customers</h3>
              <p className="text-gray-500 font-bold max-w-md">The customer registry is currently empty or no matches were found for your search.</p>
              
              <div className="mt-8 p-6 bg-amber-50 rounded-2xl border-2 border-amber-100 max-w-lg">
                <h4 className="text-amber-800 font-black uppercase text-xs mb-2">Diagnostic Assistance</h4>
                <p className="text-amber-600 text-[10px] font-bold leading-relaxed">
                  If you expect to see users here, check if they are registered in the <code className="bg-amber-100 px-1 rounded">pos_accounts</code> or <code className="bg-amber-100 px-1 rounded">users</code> collections. 
                  You can use the <strong>Manual Registry</strong> button above to track a specific Firebase UID.
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={fetchUsers} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase">Refresh Database</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(u => (
                <div key={u.id} className={`bg-white p-6 rounded-[2.5rem] border-4 transition-all shadow-sm flex flex-col gap-4 ${currentImpersonatedUid === u.id ? 'border-amber-500 ring-4 ring-amber-100' : 'border-gray-100 hover:border-amber-200'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">UID: {u.id.substring(0, 8)}...</div>
                      {isEditingBusiness === u.id ? (
                        <div className="flex gap-2">
                           <input 
                             type="text" 
                             className="flex-1 p-2 bg-gray-50 border-2 border-amber-300 rounded-lg text-sm font-black uppercase"
                             value={newBusinessName}
                             onChange={(e) => setNewBusinessName(e.target.value)}
                             autoFocus
                           />
                           <button 
                             onClick={() => handleUpdateBusinessName(u.id)}
                             className="p-2 bg-green-600 text-white rounded-lg"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                           </button>
                           <button 
                             onClick={() => setIsEditingBusiness(null)}
                             className="p-2 bg-red-600 text-white rounded-lg"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                           </button>
                        </div>
                      ) : (
                        <h3 
                          className="font-black text-gray-900 text-xl leading-tight uppercase truncate flex items-center gap-2 group/title cursor-pointer"
                          onClick={() => {
                            setIsEditingBusiness(u.id);
                            setNewBusinessName(u.businessName || '');
                          }}
                        >
                          {u.businessName}
                          <svg className="w-4 h-4 opacity-0 group-hover/title:opacity-100 text-amber-500 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </h3>
                      )}
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
                      onClick={() => handleMenuToggle(u.id, u.menuEnabled !== false)}
                      className={`col-span-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${
                        u.menuEnabled === false ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 'bg-green-600 text-white border-green-600 shadow-md'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      {u.menuEnabled === false ? 'QR MENU DISABLED' : 'QR MENU ACTIVE'}
                    </button>

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
                      onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                        u.status === 'ACTIVE' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-green-600 border-green-100 hover:border-green-200'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'ACTIVATED' : 'ACTIVATE ACCOUNT'}
                    </button>

                    <button 
                      onClick={() => setIsSettingPin(u.id)}
                      className="py-3 bg-amber-50 text-amber-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all border border-amber-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      SET PASSWORD
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

        {/* Add User Modal */}
        {isAddingUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[600] p-6 backdrop-blur-sm">
            <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tight text-center">Manual Registry</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">AUTH UID (From Firebase)</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:border-amber-500" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                  <input type="email" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:border-amber-500" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Business Name (Optional)</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:border-amber-500" value={newUserBusiness} onChange={(e) => setNewUserBusiness(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Manager PIN (4 Digits)</label>
                  <input type="password" maxLength={4} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:border-amber-500 text-center text-xl tracking-widest" value={newUserPin} onChange={(e) => setNewUserPin(e.target.value)} placeholder="••••" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsAddingUser(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-xl uppercase text-xs">Cancel</button>
                <button onClick={handleCreateUser} className="flex-2 py-4 bg-amber-500 text-amber-950 font-black rounded-xl shadow-lg uppercase text-xs">Add to Registry</button>
              </div>
            </div>
          </div>
        )}

        {/* Set PIN Modal */}
        {isSettingPin && (
           <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[600] p-6 backdrop-blur-sm">
             <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl space-y-6 text-center">
               <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                 </svg>
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight">Overwrite Access Password</h3>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">This will update the manager override PIN for the account.</p>
               <input 
                 type="password" 
                 maxLength={4}
                 placeholder="••••"
                 className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-3xl text-center text-gray-900 outline-none focus:border-amber-500" 
                 value={newManagerPin} 
                 onChange={(e) => setNewManagerPin(e.target.value)} 
               />
               <div className="flex gap-4 pt-4">
                 <button onClick={() => setIsSettingPin(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-xl uppercase text-xs tracking-widest">Cancel</button>
                 <button onClick={() => handleUpdatePin(isSettingPin)} className="flex-2 py-4 bg-amber-600 text-white font-black rounded-xl shadow-lg uppercase text-xs tracking-widest">Update PIN</button>
               </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MasterDashboardModal;
