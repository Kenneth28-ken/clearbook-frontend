
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Zap, X, Smartphone, Globe, Hash } from 'lucide-react';
import { motion } from 'motion/react';

interface QRCodeModalProps {
  onClose: () => void;
  activeUid: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose, activeUid }) => {
  const [tableNumber, setTableNumber] = useState('');
  
  // Construct the professional menu URL
  const baseUrl = window.location.origin;
  const menuUrl = `${baseUrl}/menu/${activeUid}${tableNumber ? `?table=${encodeURIComponent(tableNumber)}` : ''}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] p-6 lg:p-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row p-8 md:p-12 gap-10 text-center md:text-left relative my-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors active:scale-90 z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Side: QR Code Display */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="w-64 h-64 md:w-80 md:h-80 bg-white p-6 border-[12px] border-gray-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center relative transition-transform group-hover:scale-[1.02]">
               <QRCodeSVG 
                  value={menuUrl}
                  size={260}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/favicon.ico",
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
               />
            </div>
            {tableNumber && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl border-4 border-white">
                Table {tableNumber}
              </div>
            )}
          </div>
          
          <div className="mt-10 flex items-center gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 w-full max-w-xs truncate">
            <Globe className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-[10px] font-mono text-gray-400 truncate tracking-tight">{menuUrl}</span>
          </div>
        </div>

        {/* Right Side: Setup and Options */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic leading-none">Smart Menu</h2>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Self-Order Management</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Assign Table (Optional)</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text"
                  placeholder="e.g. 15, VIP-1, Terrace"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-black text-gray-900 shadow-inner outline-none transition-all placeholder:text-gray-300"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium italic pl-1">Generate a specific QR code for this table.</p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4 text-left shadow-sm">
               <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg rotate-3">
                 <Smartphone className="w-7 h-7" />
               </div>
               <div>
                 <div className="text-xs font-black text-indigo-900 leading-none mb-1 uppercase tracking-widest">Instant Ordering</div>
                 <div className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                   Customers can browse and place orders directly.
                 </div>
               </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full py-5 bg-gray-900 text-white font-black text-lg rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
              BACK TO POS
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRCodeModal;
