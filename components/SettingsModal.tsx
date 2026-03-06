
import React, { useState, useRef } from 'react';
import MigrationModal from './MigrationModal';

interface SettingsModalProps {
  currencySymbol: string;
  onSetCurrency: (symbol: string) => void;
  onClose: () => void;
  onOpenRecharge: () => void;
  onSimulateOrder: () => void;
  whatsappApi: string;
  onSetWhatsappApi: (val: string) => void;
  whatsappMethod: 'POST' | 'GET';
  onSetWhatsappMethod: (val: 'POST' | 'GET') => void;
  whatsappCompatibilityMode: boolean;
  onSetWhatsappCompatibilityMode: (val: boolean) => void;
  thermalProxy: string;
  onSetThermalProxy: (val: string) => void;
  onChangePassword?: (newPass: string) => void;
  onRestoreData?: (data: any) => void;
  onImportProducts?: (products: any[]) => void;
  printerType: 'USB' | 'BLUETOOTH' | 'PROXY';
  onSetPrinterType: (type: 'USB' | 'BLUETOOTH' | 'PROXY') => void;
  firstTimeMessage: string;
  onSetFirstTimeMessage: (text: string) => void;
  businessName: string;
  onSetBusinessName: (name: string) => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
  couponRate: number;
  onUpdateCouponRate: (rate: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currencySymbol, 
  onSetCurrency, 
  onClose, 
  onOpenRecharge, 
  onSimulateOrder, 
  whatsappApi, 
  onSetWhatsappApi,
  whatsappMethod,
  onSetWhatsappMethod,
  whatsappCompatibilityMode,
  onSetWhatsappCompatibilityMode,
  thermalProxy,
  onSetThermalProxy,
  onChangePassword,
  onRestoreData,
  onImportProducts,
  printerType,
  onSetPrinterType,
  firstTimeMessage,
  onSetFirstTimeMessage,
  businessName,
  onSetBusinessName,
  categories,
  onUpdateCategories,
  couponRate,
  onUpdateCouponRate
}) => {
  const [newPass, setNewPass] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currencies = [
    { name: 'US Dollar', symbol: '$' },
    { name: 'Naira', symbol: '₦' },
    { name: 'Euro', symbol: '€' },
    { name: 'Pound', symbol: '£' },
  ];

  const handleTestWebhook = async () => {
    if (!whatsappApi) return;
    setIsTesting(true);
    
    try {
      let targetUrl = whatsappApi.trim();
      const isTestUrl = targetUrl.includes('webhook-test');

      if (whatsappCompatibilityMode) {
        // GHOST MODE: This forces the request through without checking CORS permissions
        const payload = JSON.stringify({ 
          test: true, 
          mode: "Ghost_Mode_Active",
          source: "ClearBook_POS_Terminal",
          timestamp: new Date().toISOString(),
          context: "n8n_Handshake_Fix"
        });

        if (whatsappMethod === 'GET') {
          const params = new URLSearchParams({ test: 'true', mode: 'ghost' });
          targetUrl += (targetUrl.includes('?') ? '&' : '?') + params.toString();
          await fetch(targetUrl, { method: 'GET', mode: 'no-cors' });
        } else {
          // Send as text/plain to treat it as a "Simple Request" (skips CORS preflight)
          const blob = new Blob([payload], { type: 'text/plain' });
          await fetch(targetUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: blob
          });
        }

        alert(`🚀 SIGNAL DISPATCHED!\n\nGhost Mode (no-cors) bypassed the security wall.\n\nIMPORTANT: Browsers cannot read the response in this mode, so check your n8n 'Executions' or 'Test' tab now. If n8n was 'Listening', the data is there.`);
      } else {
        // STANDARD MODE: Requires the server (n8n) to have CORS enabled
        const response = await fetch(targetUrl, {
          method: whatsappMethod,
          mode: 'cors',
          headers: whatsappMethod === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
          body: whatsappMethod === 'POST' ? JSON.stringify({ test: true }) : undefined
        });

        if (response.ok) {
          alert("✅ PERFECT CONNECTION!\n\nn8n received the data and returned 200 OK.");
        } else {
          alert(`❌ n8n Error (${response.status})\n\nURL reached, but n8n rejected the message. Use 'Compatibility Mode' below.`);
        }
      }
    } catch (err: any) {
      console.error("Webhook Test Error:", err);
      alert("⚠️ CONNECTION BLOCKED\n\nYour browser or n8n blocked the request.\n\nFIX:\n1. Ensure 'CORS Compatibility Mode' is ON.\n2. In n8n, click 'Listen for Test Event' first.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportBackup = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cb_')) {
        const val = localStorage.getItem(key);
        backupData[key] = val ? JSON.parse(val) : null;
      }
    }
    
    const cache = new Set();
    const safeString = JSON.stringify(backupData, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return; // Discard circular reference
        }
        cache.add(value);
      }
      return value;
    }, 2);
    
    const blob = new Blob([safeString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClearBook_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleCsvImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        if (lines.length < 2) return;

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const newProducts: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          // Handle quoted values (simple regex)
          const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || lines[i].split(',').map(v => v.trim());
          
          if (values.length < 2) continue;

          const product: any = {
            id: Math.random().toString(36).substr(2, 9),
            createdAt: Date.now(),
            stock: 0,
            costPrice: 0,
            category: 'Uncategorized',
            barcode: ''
          };

          headers.forEach((header, index) => {
            if (index >= values.length) return;
            const value = values[index];
            
            if (header.includes('name') || header.includes('item') || header.includes('product')) product.name = value;
            else if (header.includes('price') || header.includes('sell')) product.price = parseFloat(value) || 0;
            else if (header.includes('category') || header.includes('group')) product.category = value || 'Uncategorized';
            else if (header.includes('barcode') || header.includes('sku') || header.includes('upc')) product.barcode = value;
            else if (header.includes('stock') || header.includes('qty') || header.includes('quantity')) product.stock = parseInt(value) || 0;
            else if (header.includes('cost') || header.includes('buy')) product.costPrice = parseFloat(value) || 0;
          });

          if (product.name && product.price >= 0) {
            newProducts.push(product);
          }
        }

        if (newProducts.length > 0) {
          if (confirm(`Found ${newProducts.length} valid products. Import them now?`)) {
            onImportProducts?.(newProducts);
          }
        } else {
          alert("No valid products found. Ensure CSV has headers: Name, Price, Category, Barcode, Stock");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("WARNING: Importing a backup will OVERWRITE your current sales history and product list. Proceed?")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onRestoreData?.(json);
      } catch (err) {
        alert("Error: The selected file is not a valid ClearBook backup.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-6">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-blue-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tighter text-white">System Config</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar bg-gray-50/50">
          <div className="p-6 rounded-2xl border-2 border-gray-100 bg-white">
             <div className="flex items-center gap-3 mb-3">
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Business Name</h3>
               <p className="text-xs font-bold text-gray-400 uppercase">Appears on receipts.</p>
             </div>
             <input 
               type="text"
               className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-900 uppercase"
               value={businessName}
               onChange={(e) => onSetBusinessName(e.target.value)}
               placeholder="ENTER BUSINESS NAME..."
             />
          </div>

          <div className="p-6 rounded-2xl border-2 border-gray-100 bg-white">
             <div className="flex flex-col gap-1 mb-3">
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Categories</h3>
               <p className="text-xs font-bold text-gray-400 uppercase">Comma separated list of categories. First category must be 'All'.</p>
             </div>
             <input 
               type="text"
               className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-900"
               value={categories.join(', ')}
               onChange={(e) => {
                 const newCats = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                 if (newCats[0] !== 'All') {
                   newCats.unshift('All');
                 }
                 onUpdateCategories(newCats);
               }}
               placeholder="All, Drinks, Food..."
             />
          </div>

          <div className="p-6 rounded-2xl border-2 border-gray-100 bg-white">
             <div className="flex items-center gap-3 mb-3">
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Coupon Rate (%)</h3>
               <p className="text-xs font-bold text-gray-400 uppercase">Percentage of total amount earned as coupon.</p>
             </div>
             <input 
               type="number"
               min="0"
               max="100"
               className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-900"
               value={couponRate}
               onChange={(e) => onUpdateCouponRate(parseFloat(e.target.value) || 0)}
               placeholder="5"
             />
          </div>

          <div className="p-6 bg-white border-4 border-dashed border-red-100 rounded-[2.5rem] space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-red-600">Manual Database Recovery</h3>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleExportBackup}
                  className="py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export
                </button>
                <button 
                  onClick={handleImportClick}
                  className="py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Restore
                </button>
                <button 
                  onClick={() => setShowMigration(true)}
                  className="col-span-2 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Migration Assistant
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
             </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block text-center">Local Currency</label>
            <div className="grid grid-cols-4 gap-4">
              {currencies.map(c => (
                <button 
                  key={c.symbol} 
                  onClick={() => onSetCurrency(c.symbol)} 
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${currencySymbol === c.symbol ? 'border-blue-600 bg-white text-blue-600 shadow-lg' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300'}`}
                >
                  <span className={`text-3xl font-black transition-colors ${currencySymbol === c.symbol ? 'text-blue-600' : 'text-gray-900'}`}>{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

            <div className="p-6 rounded-2xl border-2 border-gray-100 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">First-Time Message</h3>
                <p className="text-xs font-bold text-gray-400 uppercase">Sent to new customers.</p>
              </div>
              <textarea 
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-900"
                rows={3}
                value={firstTimeMessage}
                onChange={(e) => onSetFirstTimeMessage(e.target.value)}
                placeholder="Welcome message..."
              />
            </div>

            <div className="pt-8 border-t space-y-8">
             <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">n8n Cloud Webhook Bridge</label>
                <div className="bg-white p-5 rounded-[2rem] border-2 border-gray-100 shadow-sm space-y-4">
                    <div className="flex gap-2">
                       <input 
                        type="text"
                        placeholder="Paste FULL URL from n8n..."
                        className="flex-1 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-mono font-bold outline-none focus:border-green-500 text-gray-900"
                        value={whatsappApi}
                        onChange={(e) => onSetWhatsappApi(e.target.value)}
                      />
                      <button 
                        onClick={handleTestWebhook}
                        disabled={isTesting || !whatsappApi}
                        className={`px-4 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap ${!whatsappApi && 'opacity-30 cursor-not-allowed'}`}
                      >
                         {isTesting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '⚡ Test'}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Method</span>
                      <div className="flex-1 flex gap-2">
                         <button 
                           onClick={() => onSetWhatsappMethod('POST')}
                           className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${whatsappMethod === 'POST' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-400'}`}
                         >
                           POST
                         </button>
                         <button 
                           onClick={() => onSetWhatsappMethod('GET')}
                           className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${whatsappMethod === 'GET' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-400'}`}
                         >
                           GET
                         </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-2 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                       <div className="flex-1">
                          <p className="text-[10px] font-black text-orange-900 uppercase">CORS Compatibility Mode</p>
                          <p className="text-[9px] text-orange-700 font-bold uppercase tracking-tight">Ghost Mode: Bypasses browser security locks.</p>
                       </div>
                       <button 
                         onClick={() => onSetWhatsappCompatibilityMode(!whatsappCompatibilityMode)}
                         className={`w-14 h-7 rounded-full p-1 transition-all ${whatsappCompatibilityMode ? 'bg-green-600' : 'bg-gray-300'}`}
                       >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${whatsappCompatibilityMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                       </button>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                       <p className="text-[9px] text-blue-700 font-bold leading-tight">
                         <span className="font-black">HELP:</span> If using the 'Test URL' with `webhook-test`, you MUST click "Listen for event" in n8n before clicking Test here.
                       </p>
                    </div>
                </div>
             </div>

             <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Hardware: Thermal Printing</label>
                <div className="bg-blue-50/50 p-6 rounded-[2rem] border-2 border-blue-100 space-y-5">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                       </div>
                       <div className="flex-1">
                          <p className="text-[11px] font-black text-blue-900 uppercase">Printer Configuration</p>
                          <div className="flex gap-2 mt-2">
                             {(['USB', 'BLUETOOTH', 'PROXY'] as const).map(type => (
                               <button
                                 key={type}
                                 onClick={() => onSetPrinterType(type)}
                                 className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${printerType === type ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-400 border border-blue-100'}`}
                               >
                                 {type}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                    {printerType === 'PROXY' && (
                      <input 
                        type="text"
                        placeholder="Proxy IP (Optional)..."
                        className="w-full p-3 bg-white border-2 border-blue-100 rounded-xl text-[10px] font-mono font-bold outline-none focus:border-blue-500 text-gray-900 shadow-sm"
                        value={thermalProxy}
                        onChange={(e) => onSetThermalProxy(e.target.value)}
                      />
                    )}
                </div>
             </div>
          </div>

          <div className="pt-8 border-t space-y-4">
             <button onClick={onOpenRecharge} className="w-full flex items-center justify-between p-5 bg-gray-900 text-white rounded-[1.5rem] hover:bg-black transition-all active:scale-95 shadow-xl group">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-blue-600 rounded-xl">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 13V7h2v6H9z" /></svg>
                   </div>
                   <span className="font-black text-sm uppercase tracking-widest">Recharge Balance</span>
                </div>
             </button>
          </div>
        </div>
        
        <div className="p-8 bg-white border-t flex justify-center shrink-0 shadow-2xl">
          <button onClick={onClose} className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest text-sm">CLOSE & SAVE</button>
        </div>
      </div>
      {showMigration && (
        <MigrationModal 
          onClose={() => setShowMigration(false)} 
          onImport={(data) => {
            onImportProducts?.(data);
            setShowMigration(false);
          }} 
        />
      )}
    </div>
  );
};

export default SettingsModal;
