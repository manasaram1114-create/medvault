import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, Role, UserProfile } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { doc, setDoc } from 'firebase/firestore';
import { User, Phone, MapPin, Briefcase, Calendar, ChevronRight, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

const Onboarding: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(Role.PATIENT);
  const [loading, setLoading] = useState(false);
  
  // Common fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  // Patient fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  
  // Doctor fields
  const [degree, setDegree] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.role === Role.PATIENT) navigate('/patient/dashboard');
      else navigate('/doctor/dashboard');
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const profileData: any = {
      name,
      email: user.email,
      role,
      address,
      createdAt: new Date().toISOString(),
    };

    if (role === Role.PATIENT) {
      profileData.age = parseInt(age);
      profileData.gender = gender;
      profileData.bloodGroup = bloodGroup;
      profileData.isSharingEnabled = true; // Default
    } else {
      profileData.degree = degree;
    }

    try {
      if (user.uid === 'demo-user') {
        const demoProfile = { id: user.uid, ...profileData, createdAt: new Date().toISOString() };
        localStorage.setItem('medvault_demo_profile', JSON.stringify(demoProfile));
      } else {
        await setDoc(doc(db, 'users', user.uid), profileData);
      }
      await refreshProfile();
      if (role === Role.PATIENT) navigate('/patient/dashboard');
      else navigate('/doctor/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md vault-card p-8 bg-white border-none shadow-2xl"
      >
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Onboarding</h2>
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400">Secure Health Profile</p>
        </div>

        <div className="flex bg-slate-50 p-1.5 rounded-[20px] mb-8">
          <button
            onClick={() => setRole(Role.PATIENT)}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all ${
              role === Role.PATIENT 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400'
            }`}
          >
            I'm a Patient
          </button>
          <button
            onClick={() => setRole(Role.DOCTOR)}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all ${
              role === Role.DOCTOR 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400'
            }`}
          >
            I'm a Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <span className="label-caps block">Full Name</span>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="label-caps block">Address</span>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                placeholder="City, State"
              />
            </div>
          </div>

          {role === Role.PATIENT ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="label-caps block">Age</span>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                      placeholder="25"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="label-caps block">Blood</span>
                  <div className="relative text-slate-400">
                    <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <select
                      required
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all appearance-none text-slate-700 text-sm font-medium"
                    >
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="label-caps block">Gender</span>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Other'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-3 rounded-2xl text-[10px] uppercase font-bold tracking-widest border transition-all ${
                        gender === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <span className="label-caps block">Specialization</span>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                  placeholder="Cardiologist, M.D."
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 mt-4"
          >
            {loading ? 'Initializing...' : 'Complete Profile'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
