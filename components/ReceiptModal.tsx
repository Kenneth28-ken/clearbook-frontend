
import React, { useState, useEffect } from 'react';
import { CartItem, PaymentRecord, Staff, Customer, TransactionRecord } from '../types';

interface ReceiptModalProps {
  transaction: TransactionRecord;
  staff: Staff | null;
  onClose: () => void; 
  onReturnToMainMenu: () => void; 
  currencySymbol: string;
  onSaveCustomer?: (phone: string, name: string, transactionId?: string) => void; 
  whatsappApi?: string;
  whatsappMethod?: 'POST' | 'GET';
  whatsappCompatibilityMode?: boolean;
  thermalProxy?: string; 
  whatsappTokens: number; 
  onDeductToken?: () => void; 
  customers?: Customer[];
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ 
  transaction, 
  staff, 
  onClose, 
  onReturnToMainMenu, 
  currencySymbol,
  onSaveCustomer,
  whatsappApi,
  whatsappMethod = 'POST',
  whatsappCompatibilityMode = false,
  thermalProxy,
  whatsappTokens,
  onDeductToken,
  customers = []
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(transaction.customerPhone || '');
  const [customerName, setCustomerName] = useState(transaction.customerName || '');

  // REPEAT CUSTOMER RECOGNITION (By Phone)
  useEffect(() => {
    if (phoneNumber.length >= 7 && !customerName) {
      const match = customers.find(c => c.phone.includes(phoneNumber) || phoneNumber.includes(c.phone));
      if (match && match.name) {
        setCustomerName(match.name);
      }
    }
  }, [phoneNumber, customers]);

  // REPEAT CUSTOMER RECOGNITION (By Name Lookup)
  useEffect(() => {
    if (customerName.length >= 3 && !phoneNumber) {
      const match = customers.find(c => c.name?.toLowerCase().includes(customerName.toLowerCase()));
      if (match) {
        setPhoneNumber(match.phone);
      }
    }
  }, [customerName, customers]);

  const handlePrint = async () => {
    setIsPrinting(true);
    if (thermalProxy && thermalProxy.trim() !== '') {
        try {
          await fetch(thermalProxy, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify({
              id: transaction.id,
              timestamp: transaction.timestamp,
              staff: staff?.name || 'Terminal',
              items: transaction.items,
              total: transaction.total,
              currency: currencySymbol,
              customerName: customerName || transaction.customerName || 'Walk-in',
              customerPhone: phoneNumber || transaction.customerPhone || 'N/A'
            }),
          });
          setIsPrinting(false);
          return;
        } catch (e) {
          console.error("Hardware bridge silent print failed.");
        }
    }
    
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleSendWhatsApp = async () => {
    const nameValue = customerName.trim();
    const whatsappValue = phoneNumber.trim();

    if (!nameValue || !whatsappValue) {
      alert("NAME and PHONE are REQUIRED to send receipt and track repeat customers.");
      return;
    }

    if (whatsappTokens <= 0) {
      alert("INSUFFICIENT WA TOKENS: Please recharge your balance.");
      return;
    }
    
    setIsSending(true);
    executePosDelivery(nameValue, whatsappValue);

    if (onSaveCustomer) onSaveCustomer(whatsappValue, nameValue, transaction.id);
    
    setShowWhatsAppInput(false);
    setIsSending(false);
  };

  const executePosDelivery = async (name: string, phone: string) => {
    const isWebhook = whatsappApi && whatsappApi.startsWith('http');
    if (!isWebhook) {
      triggerDirectWhatsApp(name, phone);
      if (onDeductToken) onDeductToken();
      return;
    }

    try {
      const payload = JSON.stringify({
        action: "pos_receipt",
        id: transaction.id,
        customerName: name,
        phone: phone,
        total: transaction.total,
        items: transaction.items
      });

      const response = await fetch(whatsappApi!.trim(), {
        method: whatsappMethod,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: whatsappMethod === 'POST' ? payload : undefined
      });
      
      if (response.ok && onDeductToken) onDeductToken();
      else if (!response.ok) triggerDirectWhatsApp(name, phone);
    } catch (err) {
      triggerDirectWhatsApp(name, phone);
    }
  };

  const triggerDirectWhatsApp = (name: string, phone: string) => {
    const itemsText = transaction.items.map(item => 
      `• ${item.quantity}${item.type === 'WEIGHT' ? 'kg' : 'x'} ${item.name} - ${currencySymbol}${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `*CLEARBOOK DIGITAL RECEIPT*\n` +
                    `---------------------------\n` +
                    `*ORDER ID:* #${transaction.id}\n` +
                    `*CUSTOMER:* ${name.toUpperCase()}\n` +
                    `*PHONE:* ${phone}\n` +
                    `---------------------------\n` +
                    `*ITEMS PURCHASED:*\n` +
                    `${itemsText}\n` +
                    `---------------------------\n` +
                    `*TOTAL PAID: ${currencySymbol}${transaction.total.toFixed(2)}*\n` +
                    `---------------------------\n` +
                    `_Thank you for your repeat patronage!_`;

    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[500] p-4 sm:p-6 backdrop-blur-xl overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden flex flex-col shadow-2xl relative max-h-[95vh]">
        <button onClick={onClose} className="absolute top-6 right-6 z-[510] p-2 bg-black/10 rounded-full text-white/80 hover:text-white transition-all">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="bg-green-600 p-8 text-white text-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Sale Finalized</h2>
          <div className="bg-black/20 rounded-full px-4 py-1 inline-block mt-2 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-green-100">TXID: #{transaction.id}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col items-center">
          <div className="bg-white w-full p-8 shadow-2xl border-t-[12px] border-gray-900 font-mono text-xs text-gray-800 rounded-b-2xl flex flex-col">
             <div className="text-center mb-6">
                <div className="font-black text-4xl tracking-tighter text-gray-900 uppercase mb-4">Clear Book POS</div>
                <div className="uppercase font-black text-3xl text-gray-900 mt-4 border-y-4 border-gray-900 py-6 leading-tight">
                   {transaction.timestamp.toLocaleDateString()} <br/>
                   {transaction.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                {(transaction.customerName || customerName) && (
                  <div className="mt-8 bg-blue-600 py-4 px-8 rounded-2xl text-white font-black uppercase text-base shadow-lg">
                     Customer: {transaction.customerName || customerName}
                  </div>
                )}
             </div>

             <div className="space-y-4 mb-6 border-b-2 border-dashed border-gray-400 pb-8 mt-4">
                {transaction.items.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-start gap-4 text-xl font-black">
                      <span className="flex-1">{item.quantity}{item.type === 'WEIGHT' ? 'kg' : 'x'} {item.name}</span>
                      <span className="whitespace-nowrap">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                   </div>
                ))}
             </div>

             <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] shrink-0 flex justify-between items-center shadow-2xl mt-4">
               <span className="text-base opacity-60 uppercase tracking-widest font-black">Amount Paid</span>
               <span className="text-6xl font-black tabular-nums">{currencySymbol}{transaction.total.toFixed(2)}</span>
             </div>

             <div className="mt-12 text-center text-4xl text-gray-900 uppercase font-black border-t-4 border-gray-900 pt-10 tracking-tighter leading-none">
                Thank you for <br/> patronizing us!
             </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t flex flex-col gap-4">
           <div className="grid grid-cols-2 gap-4">
             <button onClick={handlePrint} disabled={isPrinting} className="py-5 rounded-2xl font-black text-xs bg-gray-900 text-white hover:bg-black transition-all uppercase">Thermal Print</button>
             <button onClick={() => setShowWhatsAppInput(true)} className="py-5 bg-green-600 text-white rounded-2xl font-black text-xs hover:bg-green-700 transition-all uppercase">Send WhatsApp</button>
           </div>
           <button onClick={onClose} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-2xl hover:bg-blue-500 transition-all uppercase tracking-tight shadow-2xl">Ready for Next Sale</button>
        </div>
      </div>

      {showWhatsAppInput && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[600] p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl flex flex-col gap-6 scale-100 animate-in zoom-in-95 duration-200">
             <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Repeat Tracking</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Mandatory fields for CRM Database</p>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Customer Name (Searchable)</label>
                   <input 
                    type="text" 
                    placeholder="Enter full name..."
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold uppercase text-gray-900 outline-none focus:border-green-500 shadow-sm"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">WhatsApp Number (Auto-Fill)</label>
                   <input 
                    type="tel"
                    placeholder="e.g. 2348012345678"
                    className="w-full p-5 bg-gray-50 border-4 border-gray-100 rounded-2xl text-2xl font-black text-center outline-none focus:border-green-500 transition-all text-gray-900 shadow-inner"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setShowWhatsAppInput(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl uppercase text-sm">Cancel</button>
                <button 
                  onClick={handleSendWhatsApp}
                  disabled={isSending || !phoneNumber || !customerName}
                  className={`flex-1 py-4 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all uppercase text-sm ${
                    !isSending && phoneNumber && customerName ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSending ? 'Sending...' : 'Confirm & Send'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptModal;