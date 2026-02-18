
import React, { useState } from 'react';
import { MobileOrder, Attendant } from '../types';

interface ServerHubModalProps {
  orders: MobileOrder[];
  attendants: Attendant[];
  onAccept: (order: MobileOrder) => void;
  onEdit: (order: MobileOrder) => void;
  onAssignServer: (orderId: string, serverId: string) => void;
  onMerge: (sourceId: string, targetId: string) => void;
  onClose: () => void;
  currencySymbol: string;
}

const ServerHubModal: React.FC<ServerHubModalProps> = ({ 
  orders, 
  attendants,
  onAccept, 
  onEdit,
  onAssignServer,
  onMerge,
  onClose, 
  currencySymbol 
}) => {
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);

  // Group orders by server ID
  const groupedOrders = attendants.reduce((acc, server) => {
    acc[server.id] = orders.filter(o => o.assignedServerId === server.id);
    return acc;
  }, {} as Record<string, MobileOrder[]>);

  const unassignedOrders = orders.filter(o => !o.assignedServerId);

  const handleMergeClick = (orderId: string) => {
    if (mergeSourceId === null) {
      setMergeSourceId(orderId);
    } else if (mergeSourceId === orderId) {
      setMergeSourceId(null);
    } else {
      onMerge(mergeSourceId, orderId);
      setMergeSourceId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[400] p-4 sm:p-10">
      <div className="bg-white rounded-[3rem] w-full h-full flex flex-col overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.5)] border-8 border-white/20">
        
        {/* Header */}
        <div className="p-8 bg-indigo-900 text-white flex justify-between items-center shrink-0 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-[2rem] shadow-2xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Attendant Dashboard</h2>
              <p className="text-indigo-300 font-bold uppercase text-xs tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Active Service Floor • {orders.length} ACTIVE TABLES
              </p>
            </div>
          </div>
          {mergeSourceId && (
            <div className="bg-orange-500 text-gray-900 px-6 py-2 rounded-full font-black text-xs animate-bounce flex items-center gap-3">
              SELECT TARGET ORDER TO MERGE WITH
              <button onClick={() => setMergeSourceId(null)} className="bg-black/20 p-1 rounded-full">×</button>
            </div>
          )}
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dashboard Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-100 flex p-6 gap-6 custom-scrollbar">
          
          {/* Unassigned Orders Column */}
          <div className="w-80 flex flex-col shrink-0">
             <div className="px-6 py-4 bg-gray-200 rounded-t-[2rem] flex justify-between items-center">
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-500">Unassigned / Mobile</h3>
                <span className="bg-gray-400 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{unassignedOrders.length}</span>
             </div>
             <div className="flex-1 bg-gray-50/50 p-4 rounded-b-[2rem] border-2 border-dashed border-gray-200 overflow-y-auto space-y-4 custom-scrollbar">
                {unassignedOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    currencySymbol={currencySymbol} 
                    onAccept={() => onAccept(order)} 
                    onEdit={() => onEdit(order)}
                    onMerge={() => handleMergeClick(order.id)}
                    isMergeSource={mergeSourceId === order.id}
                  />
                ))}
             </div>
          </div>

          {/* Individual Server Columns */}
          {attendants.map(server => {
            const serverOrders = groupedOrders[server.id] || [];
            return (
              <div key={server.id} className="w-80 flex flex-col shrink-0 animate-in slide-in-from-right-4">
                 <div className="px-6 py-4 bg-white shadow-sm border rounded-t-[2rem] flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100 uppercase">
                          {server.name.charAt(0)}
                       </div>
                       <div>
                          <div className="font-black text-gray-900 text-sm leading-none mb-1 uppercase truncate max-w-[140px]">{server.name}</div>
                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{server.role}</div>
                       </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                       <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Duties</span>
                       <span className="bg-indigo-600 text-white px-3 py-0.5 rounded-full text-[10px] font-black shadow-md">{serverOrders.length}</span>
                    </div>
                 </div>
                 <div className="flex-1 bg-white/40 p-4 rounded-b-[2rem] border-x-2 border-b-2 border-gray-100 overflow-y-auto space-y-4 custom-scrollbar">
                    {serverOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        currencySymbol={currencySymbol} 
                        onAccept={() => onAccept(order)} 
                        onEdit={() => onEdit(order)}
                        onMerge={() => handleMergeClick(order.id)}
                        isMergeSource={mergeSourceId === order.id}
                      />
                    ))}
                    {serverOrders.length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center text-gray-200 border-2 border-dashed border-gray-100 rounded-3xl mt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest">Available</span>
                      </div>
                    )}
                 </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t flex justify-between items-center shrink-0">
           <div className="flex items-center gap-4 text-gray-400">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-tight">Active tables stay parked here. Use the Merge tool to combine two checks into one. Merged items appear at the main POS during checkout.</p>
           </div>
           <button 
             onClick={onClose}
             className="px-16 py-5 bg-gray-900 text-white font-black text-xl rounded-2xl hover:bg-black shadow-2xl transition-all active:scale-95 uppercase tracking-tight"
           >
             CLOSE HUB
           </button>
        </div>
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: MobileOrder;
  currencySymbol: string;
  onAccept: () => void;
  onEdit: () => void;
  onMerge: () => void;
  isMergeSource: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, currencySymbol, onAccept, onEdit, onMerge, isMergeSource }) => {
  const total = order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const orderAge = Math.floor((new Date().getTime() - order.timestamp.getTime()) / 60000);
  
  return (
    <div className={`bg-white p-5 rounded-3xl border-4 transition-all group flex flex-col gap-4 animate-in fade-in zoom-in-95 relative ${isMergeSource ? 'border-orange-500 shadow-2xl scale-105 z-10' : 'border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200'}`}>
      <div className="flex justify-between items-start">
         <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">ID #{order.id}</div>
              <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${orderAge > 20 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                {orderAge}m ago
              </div>
            </div>
            <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors uppercase truncate pr-4">
              {order.tableNumber || order.customerName}
            </h4>
         </div>
         <div className="flex flex-col gap-2">
           <button onClick={onEdit} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
           </button>
           <button onClick={onMerge} className={`p-2 rounded-xl transition-all shadow-sm ${isMergeSource ? 'bg-orange-500 text-white' : 'bg-gray-50 text-orange-500 hover:bg-orange-500 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
           </button>
         </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 border border-gray-100/50">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex justify-between text-[10px] font-bold text-gray-600">
            <span className="truncate max-w-[120px]">{item.quantity}x {item.name}</span>
            <span className="font-mono">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="text-[8px] font-black text-gray-400 text-center uppercase tracking-widest pt-1 border-t border-dashed border-gray-200">
            + {order.items.length - 3} more items
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
         <div>
            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Bill</div>
            <div className="text-xl font-black text-gray-900 tracking-tighter leading-none">{currencySymbol}{total.toFixed(2)}</div>
         </div>
         <button 
           onClick={onAccept}
           className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
         >
           Pay Now
         </button>
      </div>
    </div>
  );
};

export default ServerHubModal;
