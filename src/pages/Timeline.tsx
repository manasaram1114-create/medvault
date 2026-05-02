import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { db, MedicalRecord } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  FileText, 
  ClipboardList, 
  ExternalLink, 
  Search, 
  Calendar,
  Filter,
  ChevronLeft,
  SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const Timeline: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!profile) return;

    if (profile.id === 'demo-user') {
      const demoRecords = JSON.parse(localStorage.getItem('medvault_demo_records') || '[]');
      // Reconstitute dates
      const parsedRecords = demoRecords.map((r: any) => ({
        ...r,
        createdAt: { toDate: () => new Date(r.createdAt.toDate ? r.createdAt.toDate() : r.createdAt) }
      }));
      setRecords(parsedRecords);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'records'),
      where('patientId', '==', profile.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord));
      setRecords(docs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const filteredRecords = records.filter(r => 
    r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center space-x-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Medical Timeline</h1>
        </header>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search files or types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>

        {loading ? (
          <div className="space-y-6 relative ml-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-[-5px] top-4 w-3 h-3 rounded-full bg-slate-200 border-2 border-white shadow-sm z-10" />
                <div className="h-32 w-full bg-slate-100 animate-pulse rounded-[24px]" />
              </div>
            ))}
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="space-y-6 relative ml-2">
            {/* Real Timeline Line */}
            <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-slate-200" />
            
            {filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-8"
              >
                {/* Timeline Dot from design */}
                <div className={`absolute left-[-5px] top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                  record.type === 'prescription' ? 'bg-slate-400' : 'bg-blue-600'
                }`} />

                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-slate-300 transition-colors">
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
                    className="p-2 text-slate-400 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-tighter"
                  >
                    View File
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No records found</h3>
            <p className="text-sm text-gray-500 px-10">Start by uploading your first prescription or medical report.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
