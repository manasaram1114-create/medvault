import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        // Silent error for scanning attempts
      }
    );

    return () => {
      scanner.clear().catch(err => console.debug("Error clearing scanner", err));
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
      >
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight">Access Scanner</h2>
              <p className="text-[10px] text-blue-400 font-bold tracking-widest leading-none">SCAN PATIENT MED-ID</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          <div id="reader" className="w-full overflow-hidden rounded-[20px] border-4 border-slate-50"></div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex items-center space-x-4 border border-slate-100">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 leading-tight">
              Position the patient's QR code within the frame to automatically view their history.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRScanner;
