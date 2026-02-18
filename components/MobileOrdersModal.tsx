
import React from 'react';
import { MobileOrder, Attendant } from '../types';

interface MobileOrdersModalProps {
  orders: MobileOrder[];
  attendants: Attendant[];
  onAccept: (order: MobileOrder) => void;
  onEdit: (order: MobileOrder) => void;
  onAssignServer: (orderId: string, serverId: string) => void;
  onClose: () => void;
  currencySymbol: string;
}

const MobileOrdersModal: React.FC<MobileOrdersModalProps> = ({ 
  orders, 
  attendants,
  onAccept, 
  onEdit,
  onAssignServer,
  onClose, 
  currencySymbol 
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] p-6">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 bg-orange-600 text-gray-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-gray-900/10 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
             </div>
             <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Incoming Mobile Orders</h2>
                <p className="text-xs font-bold opacity-60">New requests from Table QR scans</p>
             </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-50">
               <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
               </svg>
               <p className="text-xl font-black uppercase">No pending mobile orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {orders.map((order) => {
                 const orderTotal = order.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
                 const assignedServer = attendants.find(s => s.id === order.assignedServerId);

                 return (
                   <div key={order.id} className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col hover:border-orange-300 transition-all group relative">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <div className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">Queue ID #{order.id}</div>
                            <div className="text-xl font-black text-gray-900 leading-tight">{order.customerName}</div>
                            <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">
                              Received {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                         </div>
                         <button 
                           onClick={() => onEdit(order)}
                           className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                           title="Add or remove items"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                           </svg>
                         </button>
                      </div>

                      <div className="mb-4">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Assign Table Attendant</label>
                         <select 
                           className={`w-full p-3 rounded-xl text-xs font-black border-2 transition-all appearance-none cursor-pointer ${
                             order.assignedServerId ? 'border-green-100 bg-green-50 text-green-700' : 'border-gray-100 bg-gray-50 text-gray-400'
                           }`}
                           value={order.assignedServerId || ''}
                           onChange={(e) => onAssignServer(order.id, e.target.value)}
                         >
                            <option value="">SELECT SERVER...</option>
                            {attendants.map(s => (
                              <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                            ))}
                         </select>
                      </div>

                      <div className="flex-1 space-y-2 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                         {order.items.map((item, i) => (
                           <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-700">{item.quantity}x {item.name}</span>
                              <span className="font-mono text-gray-400">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                           </div>
                         ))}
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-auto">
                         <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Subtotal</div>
                            <div className="text-2xl font-black text-gray-900 tracking-tighter">
                               {currencySymbol}{orderTotal.toFixed(2)}
                            </div>
                         </div>
                         <button 
                           onClick={() => onAccept(order)}
                           className="flex-1 py-4 bg-orange-600 text-gray-900 font-black rounded-xl hover:bg-orange-500 shadow-lg shadow-orange-900/20 active:scale-95 transition-all uppercase text-sm tracking-tight"
                         >
                           Process & Merge
                         </button>
                      </div>

                      {order.assignedServerId && (
                        <div className="absolute -top-2 -left-2 bg-green-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white">
                          SERVER ASSIGNED: {assignedServer?.name.toUpperCase()}
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t flex justify-between items-center shrink-0">
           <div className="text-gray-400 text-xs font-medium">
             Waiters/Attendants in list are currently on-shift and available.
           </div>
           <button 
             onClick={onClose}
             className="px-12 py-4 bg-gray-900 text-white font-black text-lg rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-xl"
           >
             RETURN TO TERMINAL
           </button>
        </div>
      </div>
    </div>
  );
};

export default MobileOrdersModal;
