import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Pill, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Settings,
  UserCheck,
  Home,
  User,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const getMenuItems = () => {
    switch (userProfile.role) {
      case 'administrator':
        return [
          { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
          { path: '/patients', icon: Users, label: 'Manajemen Pasien' },
          { path: '/medications', icon: Pill, label: 'Manajemen Obat & Jadwal' },
          { path: '/consumption-history', icon: FileText, label: 'Rekap & Riwayat' },
          { path: '/analytics', icon: TrendingUp, label: 'Analisis Konsumsi' },
          { path: '/doctors', icon: UserCheck, label: 'Manajemen Dokter' },
          { path: '/profile', icon: User, label: 'Profil Saya' },
        ];
      case 'dokter':
        return [
          { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
          { path: '/patients', icon: Users, label: 'Data Pasien' },
          { path: '/medications', icon: Pill, label: 'Data Obat & Jadwal' },
          { path: '/consumption-history', icon: FileText, label: 'Riwayat Konsumsi' },
          { path: '/analytics', icon: TrendingUp, label: 'Analisis Kepatuhan' },
          { path: '/profile', icon: User, label: 'Profil Saya' },
        ];
      case 'pasien':
        return [
          { path: '/dashboard', icon: Home, label: 'Beranda' },
          { path: '/profile', icon: User, label: 'Profil Saya' },
          { path: '/schedule', icon: Calendar, label: 'Jadwal Obat' },
          { path: '/analytics', icon: Activity, label: 'Analisis Konsumsi' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-navy-900 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">BeomMed</h1>
        <p className="text-teal-300 text-sm mt-1">
          {userProfile.role === 'administrator' ? 'Administrator' : 
           userProfile.role === 'dokter' ? 'Dokter' : 'Pasien'}
        </p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;