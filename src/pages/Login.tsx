import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, Role } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { Heart, User, UserRoundIcon as UserDoctor, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>(Role.PATIENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Firebase Auth is not yet enabled in your Console. Please enable "Email/Password" or "Google" in the Firebase Authentication settings.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error: Unable to reach medical vault servers. Check your connection or use Demo Mode.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const enterDemoMode = () => {
    localStorage.setItem('medvault_demo_profile', JSON.stringify({
      id: 'demo-user',
      name: 'Demo Patient',
      role: Role.PATIENT,
      email: 'demo@medvault.com',
      age: '30',
      bloodGroup: 'O+',
      address: '123 Demo St, Vault City',
      isSharingEnabled: true
    }));
    window.location.reload(); // Refresh to trigger AuthProvider detection
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed') {
        setError('Network error: Unable to reach medical vault servers. Check your connection or use Demo Mode.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center flex-col items-center">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl mb-6">
            <Heart className="w-10 h-10 text-white fill-current" />
          </div>
          <h2 className="text-center text-4xl font-black tracking-tight text-slate-900">
            MedVault
          </h2>
          <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Portable Health Records
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="vault-card p-8 sm:px-10">
            <div className="flex bg-slate-50 p-1.5 rounded-[20px] mb-8">
              <button
                onClick={() => setRole(Role.PATIENT)}
                className={`flex-1 py-2.5 px-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                  role === Role.PATIENT 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Patient
              </button>
              <button
                onClick={() => setRole(Role.DOCTOR)}
                className={`flex-1 py-2.5 px-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                  role === Role.DOCTOR 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Doctor
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="space-y-1.5">
                <span className="label-caps block">Email Address</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-300" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-3 py-4 border border-slate-100 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="label-caps block">Security Key</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-300" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-3 py-4 border border-slate-100 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="space-y-4">
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-tight mt-2 bg-red-50 p-4 rounded-2xl border border-red-100">
                    {error}
                  </div>
                  { (error.includes('enabled') || error.includes('Network error')) && (
                    <button
                      type="button"
                      onClick={enterDemoMode}
                      className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      Bypass with Demo Mode
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-xl shadow-slate-200"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Vault')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="px-4 bg-white text-slate-400">Or secondary access</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={signInWithGoogle}
                  className="w-full inline-flex justify-center items-center py-4 px-4 rounded-2xl border border-slate-100 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" className="w-4 h-4 mr-3" />
                  Continue with Google
                </button>
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-slate-900 transition-colors"
              >
                {isLogin ? "Need a New Vault? Create Account" : "Access Existing Vault? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
