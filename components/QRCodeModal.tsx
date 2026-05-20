
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Zap, X, Smartphone, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface QRCodeModalProps {
  onClose: () => void;
  activeUid: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose, activeUid }) => {
  // Construct the professional menu URL
  const baseUrl = window.location.origin;
  const menuUrl = `${baseUrl}/menu/${activeUid}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col items-center p-12 text-center relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-20 h-2 bg-gray-100 rounded-full mb-10"></div>
        
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Digital Menu</h2>
          <p className="text-gray-500 font-medium">Auto-generated for your business</p>
        </div>

        {/* Professional Scannable QR Code */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="w-72 h-72 bg-white p-6 border-[12px] border-gray-900 rounded-[2.5rem] shadow-2xl mb-10 flex items-center justify-center relative transition-transform group-hover:scale-[1.02]">
             <QRCodeSVG 
                value={menuUrl}
                size={230}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/favicon.ico", // or a branded icon if available
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
             />
          </div>
        </div>

        <div className="space-y-4 w-full">
           <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg rotate-3">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-black text-indigo-900 leading-none mb-1 uppercase tracking-widest">Global Access</div>
                <div className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                  Provide this QR code to customers. No app installation required.
                </div>
              </div>
           </div>

           <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4 truncate">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[10px] font-mono text-gray-500 truncate">{menuUrl}</span>
           </div>
           
           <button 
             onClick={onClose}
             className="w-full py-5 bg-gray-900 text-white font-black text-lg rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2"
           >
             <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
             ACTIVATE TERMINAL
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QRCodeModal;
