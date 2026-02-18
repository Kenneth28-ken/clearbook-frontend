
import React from 'react';

interface QRCodeModalProps {
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose }) => {
  // Construct a functional URL that triggers Customer Mode
  const baseUrl = window.location.origin + window.location.pathname;
  const customerUrl = `${baseUrl}?view=customer`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(customerUrl)}&margin=10&bgcolor=ffffff&color=111827&format=svg`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] p-6">
      <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col items-center p-12 text-center animate-in zoom-in-90 duration-300">
        <div className="w-20 h-2 bg-gray-200 rounded-full mb-10"></div>
        
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">SCANNABLE MENU</h2>
          <p className="text-gray-500 font-medium">Point your camera to browse and order</p>
        </div>

        {/* Real Scannable QR Code */}
        <div className="w-72 h-72 bg-white p-4 border-[12px] border-indigo-600 rounded-[2.5rem] shadow-2xl mb-10 flex items-center justify-center relative group">
           <img 
              src={qrCodeUrl} 
              alt="Scan to order" 
              className="w-full h-full rounded-xl transition-transform group-hover:scale-105"
           />
           {/* Center Logo Icon Overlay */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-white border-4 border-indigo-600 rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-xl">C</div>
           </div>
        </div>

        <div className="space-y-4 w-full">
           <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-black text-indigo-900 leading-none mb-1 uppercase">Instant Ordering</div>
                <div className="text-xs text-indigo-700 font-medium">Scanned orders appear on the terminal instantly.</div>
              </div>
           </div>
           
           <button 
             onClick={onClose}
             className="w-full py-5 bg-gray-900 text-white font-black text-lg rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
           >
             RETURN TO POS
           </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
