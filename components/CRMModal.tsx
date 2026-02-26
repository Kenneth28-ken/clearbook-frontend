
import React, { useState } from 'react';
import { Customer } from '../types';

interface CRMModalProps {
  customers: Customer[];
  onClose: () => void;
  whatsappApi?: string;
  onUpdateName?: (phone: string, name: string) => void | Promise<void>;
  whatsappTokens: number;
}

const CRMModal: React.FC<CRMModalProps> = ({ customers, onClose, whatsappApi, onUpdateName, whatsappTokens }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const templates = [
    { id: 'thanks', label: 'Thank You', message: "Thank you for shopping with us! How was your experience today?" },
    { id: 'valentine', label: 'Valentine❤️', message: "Happy Valentine's Day! ❤️ We have special romantic deals waiting for you today!" },
    { id: 'christmas', label: 'Christmas🎄', message: "Merry Christmas! 🎄 Enjoy our festive discounts across all departments." },
    { id: 'weekend', label: 'Weekend Deal🚀', message: "It's the Weekend! 🚀 Don't miss our exclusive flash sales happening right now." },
    { id: 'sunday', label: 'Sunday Special☀️', message: "Happy Sunday! ☀️ Visit us today for our special Sunday family grocery bundles." },
  ];

  const filteredCustomers = customers.filter(c => 
    c.phone.includes(searchTerm) || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sendMessage = (phone: string, text: string) => {
    const encoded = encodeURIComponent(text);
    const waPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[450] p-4 sm:p-10">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl h-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-4 border-white/20">
        
        {/* Header */}
        <div className="p-8 bg-green-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl text-white">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Customer Loyalty Hub</h2>
              <div className="flex items-center gap-3 mt-1">
                 <p className="text-green-100 font-bold uppercase text-[10px] tracking-widest">Visit Tracking & Marketing</p>
                 <span className="w-1 h-1 bg-green-300 rounded-full"></span>
                 <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full border border-white/10">
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{whatsappTokens} WA TOKENS</span>
                 </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-50">
          
          {/* Left: Customer Database List */}
          <div className="w-full md:w-[60%] flex flex-col border-r bg-white overflow-hidden">
             <div className="p-6 border-b shrink-0 bg-gray-50">
                <div className="relative">
                   {/* FIXED: Text color set to gray-900 so letters are black */}
                   <input 
                     type="text" 
                     placeholder="Find customer by phone or name..."
                     className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 focus:border-green-500 rounded-2xl font-black outline-none transition-all text-gray-900"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                   <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {filteredCustomers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 p-10 text-center">
                     <p className="font-black text-xs uppercase tracking-widest">Database Empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b">
                      <span className="col-span-4">Customer Name / ID</span>
                      <span className="col-span-3">Phone</span>
                      <span className="col-span-3">Visit Stats</span>
                      <span className="col-span-2 text-right">Actions</span>
                    </div>
                    {filteredCustomers.map(customer => (
                      <div key={customer.phone} className="p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-green-200 transition-all grid grid-cols-12 items-center gap-4 group">
                         <div className="col-span-4">
                            <input 
                              type="text"
                              placeholder="TAP TO SET NAME"
                              className="w-full font-black text-gray-900 bg-transparent border-b border-transparent focus:border-green-400 outline-none uppercase text-sm placeholder:text-gray-200"
                              value={customer.name || ''}
                              onChange={(e) => onUpdateName?.(customer.phone, e.target.value)}
                            />
                            <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">Loyalty Record</div>
                         </div>
                         <div className="col-span-3">
                            <div className="text-sm font-black tabular-nums text-gray-700">{customer.phone}</div>
                            <div className="text-[10px] font-black text-blue-600 uppercase mt-1">Bal: {(customer.couponBalance || 0).toFixed(2)}</div>
                         </div>
                         <div className="col-span-3">
                            <div className="flex items-center gap-2">
                               <div className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase">
                                  {customer.visitCount} VISITS
                               </div>
                               <div className="text-[8px] font-bold text-gray-400 uppercase">
                                  Last: {customer.lastVisit.toLocaleDateString()}
                               </div>
                            </div>
                         </div>
                         <div className="col-span-2 flex justify-end">
                            <button 
                              onClick={() => sendMessage(customer.phone, "Hello! We value your patronage. Thank you for visiting us again!")}
                              className="p-2 bg-green-600 text-white rounded-xl shadow-lg active:scale-90 transition-all"
                            >
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                               </svg>
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* Right: Automated Marketing Tools */}
          <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar bg-white">
             <div className="mb-8">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Message Templates</h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Send specialized deals to loyal customers</p>
             </div>

             <div className="space-y-4">
                {templates.map(tmpl => (
                  <div key={tmpl.id} className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 transition-all hover:border-green-400">
                     <div className="flex justify-between items-center mb-4">
                        <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[8px] font-black uppercase tracking-widest">{tmpl.label}</span>
                        <div className="flex gap-2">
                           {filteredCustomers.slice(0, 2).map(c => (
                             <button 
                               key={c.phone}
                               onClick={() => sendMessage(c.phone, tmpl.message)}
                               className="px-3 py-2 bg-green-600 text-white rounded-xl font-black text-[9px] uppercase tracking-tighter hover:bg-green-700 active:scale-90 transition-all"
                             >
                               To {c.name || c.phone.slice(-4)}
                             </button>
                           ))}
                        </div>
                     </div>
                     <div className="p-4 bg-white rounded-2xl border border-gray-100 italic text-xs text-gray-500 leading-relaxed">
                        "{tmpl.message}"
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Simplified Footer */}
        <div className="p-8 bg-white border-t flex justify-between items-center shrink-0">
           <div className="flex items-center gap-3 text-gray-400">
             <p className="text-[10px] font-black uppercase tracking-widest max-w-[400px]">
                Loyalty counts increase with every WhatsApp receipt. Names are optional but help personalize your business service.
             </p>
           </div>
           <button 
             onClick={onClose}
             className="px-16 py-5 bg-gray-900 text-white font-black text-lg rounded-2xl hover:bg-black shadow-2xl transition-all active:scale-95 uppercase tracking-tight"
           >
             CLOSE CRM
           </button>
        </div>
      </div>
    </div>
  );
};

export default CRMModal;
