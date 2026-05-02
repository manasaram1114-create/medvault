import React, { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { QRCodeSVG } from 'qrcode.react';
import { db, Role } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  User, 
  MapPin, 
  Droplets, 
  Calendar, 
  Upload, 
  Clock, 
  Shield, 
  QrCode,
  Share2,
  Info,
  X,
  Plus,
  Bell,
  Stethoscope,
  Pill,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import HealtHuBot from '../components/HealtHuBot';

const PatientDashboard: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Mock reminders for "cool features"
  const reminders = [
    { id: 1, title: 'Amoxicillin 500mg', time: '08:00 AM', type: 'med', color: 'blue' },
    { id: 2, title: 'General Checkup', time: '11:30 AM', type: 'appt', color: 'green' },
  ];

  if (!profile) return null;

  const toggleSharing = async () => {
    setUpdating(true);
    try {
      const docRef = doc(db, 'users', profile.id);
      await updateDoc(docRef, {
        isSharingEnabled: !profile.isSharingEnabled
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 max-w-md mx-auto space-y-8 relative">
      {/* App Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">VaultOS</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-black">Personal Health Cloud</p>
        </div>
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center p-1 border-2 border-slate-100 shadow-xl">
          <div className="w-full h-full bg-blue-500 rounded-xl flex items-center justify-center text-white font-black">
            {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        </div>
      </div>

      {/* Hero Stats Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-950 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[50px]" />
        
        <div className="flex justify-between items-start mb-10 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Health Integrity</p>
            <h2 className="text-3xl font-black">{profile.name.split(' ')[0]}</h2>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
            <div className={`w-2 h-2 rounded-full ${profile.isSharingEnabled ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{profile.isSharingEnabled ? 'Open Vault' : 'Vault Locked'}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 relative z-10">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Blood</p>
            <p className="text-lg font-black">{profile.bloodGroup}</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Age</p>
            <p className="text-lg font-black">{profile.age}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">V-Score</p>
            <p className="text-lg font-black">98 <span className="text-[10px] text-blue-400 font-bold">%</span></p>
          </div>
        </div>
      </motion.div>

      {/* Access Control Hub */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQR(true)}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm cursor-pointer"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
            <QrCode className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">Share ID</p>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={toggleSharing}
          className={`bg-white p-6 rounded-[2rem] border flex flex-col items-center text-center shadow-sm cursor-pointer transition-colors ${profile.isSharingEnabled ? 'border-green-100' : 'border-slate-100'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${profile.isSharingEnabled ? 'bg-green-50' : 'bg-slate-50'}`}>
            <Shield className={`w-6 h-6 ${profile.isSharingEnabled ? 'text-green-600' : 'text-slate-400'}`} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">
            {profile.isSharingEnabled ? 'Revoke Access' : 'Enable Access'}
          </p>
        </motion.div>
      </div>

      {/* Reminders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Health Sprints</span>
          </div>
          <button className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {reminders.map((rem, i) => (
            <motion.div
              key={rem.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  rem.type === 'med' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                }`}>
                  {rem.type === 'med' ? <Pill className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{rem.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{rem.time}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Menu Area */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/patient/upload" 
          className="p-6 bg-blue-600 rounded-[2.5rem] text-white flex flex-col items-center justify-center space-y-3 shadow-xl shadow-blue-200 active:scale-95 transition-transform"
        >
          <Upload className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Vault Upload</span>
        </Link>
        <Link 
          to="/patient/timeline" 
          className="p-6 bg-slate-100 rounded-[2.5rem] text-slate-900 flex flex-col items-center justify-center space-y-3 active:scale-95 transition-transform"
        >
          <Clock className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Access Log</span>
        </Link>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-8 w-full max-w-sm flex flex-col items-center relative shadow-2xl border border-slate-100"
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
                <Share2 className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Vault Passport</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center mb-10">Scan for Secure Access</p>
              
              <div className="p-6 bg-white border-4 border-slate-50 rounded-[3rem] shadow-inner mb-10">
                <QRCodeSVG 
                  value={profile.id} 
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Secure</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;

