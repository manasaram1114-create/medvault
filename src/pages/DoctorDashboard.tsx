import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { User, Search, QrCode, ArrowRight, ClipboardList, Briefcase, UserCircle, History, Camera, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRScanner from '../components/QRScanner';

const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  // Mock recently accessed patients for visual "coolness"
  const recentPatients = [
    { id: 'demo-user', name: 'John Doe', lastVisit: '2h ago' },
  ];

  if (!profile) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  const onScan = (decodedText: string) => {
    setPatientId(decodedText);
    setShowScanner(false);
    navigate(`/doctor/patient/${decodedText}`);
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 max-w-md mx-auto space-y-8">
      {/* Doctor Identity */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">VaultOS</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-black">Authorized Professional</p>
        </div>
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center p-1 border-2 border-slate-100 shadow-xl">
          <div className="w-full h-full bg-blue-500 rounded-xl flex items-center justify-center text-white font-black">
            {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="vault-card p-6 flex items-center justify-between border-l-4 border-l-blue-500"
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
            <UserCircle className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Dr. {profile.name}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{profile.degree} • Specialist</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter">Online</span>
        </div>
      </motion.div>

      {/* Lookup Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="vault-card p-8 bg-slate-950 text-white border-none shadow-2xl shadow-blue-900/20"
      >
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 flex items-center">
              Vault Access
              <ShieldCheck className="w-4 h-4 ml-2 text-blue-400" />
            </h3>
            <p className="text-[10px] text-slate-400 font-bold">DECRYPT PATIENT BIOMETRIC HISTORY</p>
          </div>
          <button 
            onClick={() => setShowScanner(true)}
            className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manual Identifier</span>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input 
                type="text"
                placeholder="Enter Secure UID..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!patientId.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale py-5 rounded-[20px] font-bold text-sm uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-900/50"
          >
            <span>Decrypt Access</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>

      {/* Recently Accessed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Terminal Log</span>
          </div>
          <span className="text-[10px] font-bold text-blue-500">View All</span>
        </div>

        <div className="space-y-3">
          {recentPatients.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => navigate(`/doctor/patient/${p.id}`)}
              className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-xs text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500">
                  {p.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Vault Access: {p.lastVisit}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showScanner && (
          <QRScanner onScan={onScan} onClose={() => setShowScanner(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorDashboard;

