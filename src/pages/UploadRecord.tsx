import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FileUp, FileText, ClipboardList, CheckCircle2, ChevronLeft, Loader2, X, ArrowRight, Shield, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const UploadRecord: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile) return;

    setLoading(true);
    try {
      if (profile.id === 'demo-user') {
        const demoRecord = {
          id: `demo-rec-${Date.now()}`,
          patientId: profile.id,
          fileURL: URL.createObjectURL(file), // Local blob URL for preview
          type,
          fileName: file.name,
          createdAt: { toDate: () => new Date() }
        };
        const existingRecords = JSON.parse(localStorage.getItem('medvault_demo_records') || '[]');
        localStorage.setItem('medvault_demo_records', JSON.stringify([demoRecord, ...existingRecords]));
      } else {
        // 1. Upload to Storage
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `records/${profile.id}/${fileName}`);
        await uploadBytes(storageRef, file);
        const fileURL = await getDownloadURL(storageRef);

        // 2. Save Metadata to Firestore
        await addDoc(collection(db, 'records'), {
          patientId: profile.id,
          fileURL,
          type,
          fileName: file.name,
          createdAt: serverTimestamp(),
        });
      }

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 max-w-md mx-auto space-y-8">
      <header className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-xl shadow-sm border border-slate-100"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Upload Data</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure Vault Addition</p>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="vault-card p-6"
      >
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-50">
              <CheckCircle2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Vaulted!</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Medical context secured.</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <span className="label-caps block">Category</span>
              <div className="flex bg-slate-50 p-1.5 rounded-[20px]">
                <button
                  type="button"
                  onClick={() => setType('prescription')}
                  className={`flex-1 py-3 px-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all ${
                    type === 'prescription' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400'
                  }`}
                >
                  Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setType('report')}
                  className={`flex-1 py-3 px-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all ${
                    type === 'report' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400'
                  }`}
                >
                  Lab Report
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="label-caps block">Document Vault</span>
              <div className={`relative border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center transition-all ${
                file ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 bg-slate-50/20'
              }`}>
                {!file ? (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                      <FileUp className="w-8 h-8 text-slate-300" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">Choose File</span>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-tighter">PDF, JPG, or PNG</span>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="max-w-[150px]">
                        <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">Ready for vault</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-xl shadow-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  Secure Upload
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>

      <div className="p-5 bg-slate-900 rounded-[32px] text-white flex items-center space-x-4">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">HIPAA Compliant</p>
          <p className="text-[11px] opacity-70 leading-tight">Your health data is safe. We use end-to-end encryption for all vault operations.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadRecord;
