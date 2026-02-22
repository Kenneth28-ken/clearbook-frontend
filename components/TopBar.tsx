
import React from 'react';
import { Staff, SystemMode } from '../types';

interface TopBarProps {
  staff: Staff | null;
  time: Date;
  onLogout: () => void;
  onSwitchStaff?: () => void;
  onOpenSettings: () => void;
  onOpenInventory: () => void;
  onOpenServerHub: () => void;
  onOpenTokenRecharge: () => void;
  onOpenCRM: () => void;
  onSimulateOrder: () => void;
  lowStockCount: number;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenQRCode: () => void;
  onOpenMobileOrders: () => void;
  mobileOrderCount: number;
  systemMode: SystemMode;
  tokens: number;
  whatsappTokens: number; // New
  isTerminalLocked: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  isMaster?: boolean;
  onOpenStaffManagement: () => void;
  onOpenMasterDashboard: () => void;
  onOpenPrismaticAudit: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  staff, time, onLogout, onSwitchStaff, onOpenSettings, onOpenInventory, onOpenServerHub, onOpenTokenRecharge, onOpenCRM, onSimulateOrder, lowStockCount, isEditMode, onToggleEditMode, onOpenQRCode, onOpenMobileOrders, mobileOrderCount, systemMode, tokens, whatsappTokens, isTerminalLocked, isOnline, isSyncing, isMaster, onOpenStaffManagement, onOpenMasterDashboard, onOpenPrismaticAudit 
}) => {
  return (
    <header className={`h-16 flex items-center justify-between px-6 shrink-0 border-b z-50 transition-colors ${isTerminalLocked ? 'bg-red-900 border-red-800' : 'bg-gray-800 border-gray-700'}`}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-black shadow-lg text-white text-xs">CB</div>
          <span className="font-bold text-xl tracking-tight text-white hidden sm:inline">Clear <span className="text-blue-400">Book</span></span>
        </div>
        <div className="h-6 w-px bg-gray-700"></div>
        <div className="flex items-center gap-3">
           <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${systemMode === SystemMode.RESTAURANT ? 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30' : 'bg-green-600/20 text-green-400 border-green-600/30'}`}>{systemMode}</div>
           
           <button 
             onClick={onOpenPrismaticAudit}
             className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all hover:scale-105 active:scale-95 ${isOnline ? 'bg-green-600/10 border-green-500/30 text-green-400' : 'bg-orange-600/10 border-orange-500/30 text-orange-400'}`}
           >
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isSyncing ? 'SYNCING...' : isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
           </button>

           <button onClick={onOpenTokenRecharge} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${isTerminalLocked ? 'bg-white text-red-600 border-white' : 'bg-blue-600/10 border-blue-500/30 text-blue-400'}`} title="Sales Units">
              <span className="text-[10px] font-black uppercase tracking-widest">{tokens} SALES</span>
           </button>

           <button onClick={onOpenTokenRecharge} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all bg-green-600/10 border-green-500/30 text-green-400 hover:bg-green-600/20`} title="WhatsApp Units">
              <span className="text-[10px] font-black uppercase tracking-widest">{whatsappTokens} WA</span>
           </button>
           
           {isMaster && (
             <button onClick={onOpenMasterDashboard} className="px-3 py-1 bg-amber-400 text-amber-950 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse hover:bg-amber-300 transition-colors">Master Overload</button>
           )}
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-2">
          <button onClick={onOpenInventory} className={`relative p-2.5 rounded-xl transition-all shadow-sm ${lowStockCount > 0 ? 'bg-red-600/20 text-red-400' : 'bg-gray-700 text-blue-400 hover:bg-gray-600 hover:text-white'}`} title="Registry">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-800 shadow-lg animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>
          
          <button onClick={onOpenCRM} className={`p-2.5 rounded-xl flex items-center gap-2 transition-all bg-gray-700 hover:bg-green-600 text-green-400 hover:text-white shadow-sm`} title="Loyalty">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            <span className="text-[10px] font-black uppercase hidden lg:inline">CRM</span>
          </button>

          {!isTerminalLocked && systemMode === SystemMode.RESTAURANT && (
            <>
              <button onClick={onOpenServerHub} className="p-2.5 bg-gray-700 hover:bg-indigo-600 rounded-xl text-indigo-400 hover:text-white transition-all shadow-sm" title="Server Hub">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </button>
              <button onClick={onOpenMobileOrders} className="p-2.5 relative bg-gray-700 hover:bg-orange-600 rounded-xl text-orange-400 hover:text-gray-900 transition-all shadow-sm" title="Mobile Queue">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                {mobileOrderCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce border-2 border-gray-800">{mobileOrderCount}</span>}
              </button>
            </>
          )}

          <div className="h-6 w-px bg-gray-700"></div>

          <button onClick={onOpenStaffManagement} className="p-2.5 bg-gray-700 hover:bg-blue-600 rounded-xl text-blue-400 hover:text-white transition-all shadow-sm" title="Staff">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
          
          <button onClick={onOpenSettings} className="p-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 hover:text-white transition-all shadow-sm" title="Setup">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
            <div className="flex flex-col items-end">
               <span className="text-white font-bold text-xs truncate max-w-[80px]">{staff?.name}</span>
               <button onClick={onSwitchStaff} className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Switch Profile</button>
            </div>
            <button onClick={onLogout} className="p-2.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm" title="Exit">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
