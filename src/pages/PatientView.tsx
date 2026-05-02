import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, MedicalRecord, UserProfile, Role } from '../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  User, 
  ChevronLeft, 
  ShieldAlert, 
  FileText, 
  ClipboardList, 
  ExternalLink,
  Calendar,
  Droplets,
  MapPin,
  Lock,
  SearchX,
  History
} from 'lucide-react';
import { motion } from 'motion/react';

const PatientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPatientAndRecords = async () => {
      try {
        if (id === 'demo-user') {
          const demoProfile = JSON.parse(localStorage.getItem('medvault_demo_profile') || 'null');
          if (!demoProfile) {
            setError('Patient not found');
            setLoading(false);
            return;
          }
          setPatient(demoProfile);
          const demoRecords = JSON.parse(localStorage.getItem('medvault_demo_records') || '[]');
          const parsedRecords = demoRecords.map((r: any) => ({
            ...r,
            createdAt: { toDate: () => new Date(r.createdAt.toDate ? r.createdAt.toDate() : r.createdAt) }
          }));
          setRecords(parsedRecords);
          setLoading(false);
          return;
        }

        // 1. Fetch Patient Profile
        const patientDoc = await getDoc(doc(db, 'users', id));
        if (!patientDoc.exists()) {
          setError('Patient not found');
          setLoading(false);
          return;
        }

        const patientData = { id: patientDoc.id, ...patientDoc.data() } as UserProfile;
        setPatient(patientData);

        // 2. Check Sharing Status
        if (patientData.isSharingEnabled === false) {
          setLoading(false);
          return;
        }

        // 3. Fetch Records
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', id),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord));
          setRecords(docs);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error(err);
        setError('Error accessing patient data');
        setLoading(false);
      }
    };

    fetchPatientAndRecords();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="h-40 bg-white rounded-3xl animate-pulse" />
          <div className="h-64 bg-white rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Patient Not Found'}</h2>
        <p className="text-gray-500 mb-8 px-10">We couldn't locate the patient profile or access was denied.</p>
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // If sharing is OFF
  if (patient.isSharingEnabled === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-gray-100">
          <Lock className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Access Denied</h2>
        <p className="text-gray-500 mb-10 max-w-[280px] mx-auto leading-relaxed">
          Dr. {patient.name} has disabled data sharing. Please ask the patient to enable sharing from their dashboard.
        </p>
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="flex items-center space-x-2 text-blue-600 font-bold hover:bg-blue-50 px-6 py-3 rounded-2xl transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Exit Vault</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 max-w-md mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="p-3 bg-white rounded-xl shadow-sm border border-slate-100"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="px-4 py-2 bg-blue-600 text-white rounded-full flex items-center space-x-2 shadow-lg shadow-blue-100">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest">Secure Access Active</span>
        </div>
      </header>

      {/* Patient Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="vault-card p-6"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Patient Profile</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="label-caps block mb-1">Age</span>
            <p className="font-bold text-slate-800">{patient.age} Yrs</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="label-caps block mb-1">Blood Type</span>
            <p className="font-bold text-slate-800">{patient.bloodGroup}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl flex items-start space-x-3">
          <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
          <div>
            <span className="label-caps block mb-1">Address</span>
            <p className="text-sm text-slate-600 leading-tight font-medium">{patient.address}</p>
          </div>
        </div>
      </motion.div>

      {/* Medical History */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Medical Timeline</h3>
        
        {records.length > 0 ? (
          <div className="space-y-4 relative ml-2">
            <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-slate-200" />
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-8"
              >
                <div className={`absolute left-[-5px] top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                  record.type === 'prescription' ? 'bg-slate-400' : 'bg-blue-600'
                }`} />

                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      record.type === 'prescription' ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {record.type === 'prescription' ? <FileText className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-tight mb-0.5 ${
                        record.type === 'prescription' ? 'text-slate-400' : 'text-blue-600'
                      }`}>
                        {record.type}
                      </p>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        {record.fileName.split('_').pop()}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {record.createdAt?.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <a 
                    href={record.fileURL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-blue-600 font-bold text-[10px] uppercase tracking-tighter"
                  >
                    View PDF
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="vault-card p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-900 uppercase">No Data Found</p>
            <p className="text-[10px] text-slate-400 font-medium">This patient vault is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientView;
