import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { LogOut, Heart, User, LayoutDashboard, PlusCircle, History } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('medvault_demo_profile');
    await auth.signOut();
    navigate('/login');
  };

  if (!user || !profile) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-t md:border-b md:border-t-0 border-slate-100 fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tight">MedVault</span>
          </div>

          <div className="flex flex-1 justify-around md:justify-end md:space-x-8">
            <Link
              to={profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'}
              className="flex flex-col items-center text-slate-300 hover:text-slate-900 transition-colors"
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="hidden">Dashboard</span>
            </Link>

            {profile.role === 'patient' && (
              <>
                <Link
                  to="/patient/upload"
                  className="flex flex-col items-center text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <PlusCircle className="w-6 h-6" />
                </Link>
                <Link
                  to="/patient/timeline"
                  className="flex flex-col items-center text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <History className="w-6 h-6" />
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="flex flex-col items-center text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
